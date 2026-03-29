const { load } = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const host = 'https://yjs.sxufe.edu.cn';
const gotOpts = { https: { rejectUnauthorized: false }, dnsLookupIpVersion: 'ipv4' };

async function handler(ctx) {
    const type = ctx.params.type.replace(/-/g, '/');
    const pageUrl = `${host}/${type}.htm`;

    const response = await got(pageUrl, gotOpts);
    const $ = load(response.data);

    const typeName = $('.g-title1 h3').text().trim() || '通知公告';

    const list = $('ul.m-list12 li')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a');
            const dateText = item.find('span.time').text().trim();
            const href = a.attr('href');
            return {
                title: a.attr('title') || a.text().trim(),
                link: href ? new URL(href, pageUrl).href : '',
                pubDate: timezone(parseDate(dateText), 8),
            };
        })
        .filter((item) => item.link);

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                try {
                    const res = await got(item.link, gotOpts);
                    const $d = load(res.data);
                    item.description = $d('.v_news_content').html() || item.title;
                } catch {
                    item.description = item.title;
                }
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `山西财经大学研究生院 - ${typeName}`,
        link: pageUrl,
        item: items,
    };
}

module.exports = handler;
