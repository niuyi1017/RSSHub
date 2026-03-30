const { load } = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const host = 'https://yjsb.tjus.edu.cn';
const gotOpts = { https: { rejectUnauthorized: false } };

async function handler(ctx) {
    const type = ctx.params.type;
    const pageUrl = `${host}/list2.jsp?urltype=tree.TreeTempUrl&wbtreeid=${type}`;

    const response = await got(pageUrl, gotOpts);
    const $ = load(response.data);

    const typeName = $('td[background*="other_bg"] p span').first().text().trim() || '招生工作';

    const list = $('a.c16068')
        .toArray()
        .map((el) => {
            const a = $(el);
            const title = a.attr('title') || a.text().trim();
            const href = a.attr('href');
            const dateText = a.closest('tr').find('td[class*="timestyle"]').text().trim();
            return {
                title,
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
                    item.description = $d('#vsb_content').html() || item.title;
                } catch {
                    item.description = item.title;
                }
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `天津体育学院研究生处 - ${typeName}`,
        link: pageUrl,
        item: items,
    };
}

module.exports = handler;
