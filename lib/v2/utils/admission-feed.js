const cheerio = require('cheerio');
const asyncPool = require('tiny-async-pool');

const maxItems = 20;
const maxDescriptionBytes = 128 * 1024;

function getLimit(ctx) {
    const limit = Number(ctx.query?.limit);
    return Number.isInteger(limit) && limit > 0 ? Math.min(limit, maxItems) : maxItems;
}

function prepareItems(items, ctx) {
    const seen = new Set();
    return items
        .filter((item) => {
            if (!item.title?.trim() || !/^https?:\/\//i.test(item.link || '') || seen.has(item.link)) {
                return false;
            }
            seen.add(item.link);
            return true;
        })
        .slice(0, getLimit(ctx));
}

async function mapItems(items, mapper) {
    const results = new Array(items.length);
    for await (const { index, value } of asyncPool(
        3,
        items.map((item, index) => ({ item, index })),
        async ({ item, index }) => ({ index, value: await mapper(item) })
    )) {
        results[index] = value;
    }
    return results;
}

function compactDescription(html, link) {
    const $ = cheerio.load(html || '', null, false);
    let omitted = $('script, iframe, object, embed').length > 0;
    $('script, style, noscript').remove();
    $('*').each((_, element) => {
        const el = $(element);
        for (const name of Object.keys(element.attribs)) {
            if (/^(style|class|id|on\w+)$/i.test(name)) {
                el.removeAttr(name);
            }
        }
        for (const name of ['src', 'href', 'srcset']) {
            const value = el.attr(name);
            if (!value) {
                continue;
            }
            if (/data:/i.test(value)) {
                el.removeAttr(name);
                omitted = true;
            } else if (name !== 'srcset') {
                try {
                    const url = new URL(value, link);
                    if (/^https?:$/.test(url.protocol)) {
                        el.attr(name, url.href);
                    } else {
                        el.removeAttr(name);
                    }
                } catch (_) {
                    el.removeAttr(name);
                }
            }
        }
    });
    let result = $.html();
    // Large published rosters can exceed the entire RSS client's budget even without inline styles.
    if (Buffer.byteLength(result) > maxDescriptionBytes) {
        const excerpt = $('<p>').text($.root().text().replace(/\s+/g, ' ').trim().slice(0, 12000));
        result = excerpt.prop('outerHTML');
        $('a[href]')
            .slice(0, 30)
            .each((_, el) => {
                const anchor = $('<a>').attr('href', $(el).attr('href')).text($(el).text().trim().slice(0, 200));
                const paragraph = $('<p>').append(anchor).prop('outerHTML');
                if (Buffer.byteLength(result + paragraph) < maxDescriptionBytes - 2048) {
                    result += paragraph;
                }
            });
        omitted = true;
    }
    if (omitted) {
        result += $('<p>').append($('<a>').attr('href', link).text('完整正文、内嵌图片及附件请查看官网原文')).prop('outerHTML');
    }
    return result;
}

module.exports = { getLimit, prepareItems, mapItems, compactDescription };
