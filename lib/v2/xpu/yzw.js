const { load } = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const host = 'https://yzw.xpu.edu.cn';
const gotOpts = { https: { rejectUnauthorized: false }, dnsLookupIpVersion: 'ipv4' };

async function handler(ctx) {
    const type = ctx.params.type;
    const pageUrl = `${host}/index/${type}.htm`;

    const response = await got(pageUrl, gotOpts);
    const $ = load(response.data);

    const typeName = $('.wape-left div').first().text().trim() || '通知公告';

    const list = $('ul.ss li')
        .toArray()
        .map((el) => {
            const li = $(el);
            const a = li.find('a');
            const title = a.attr('title') || a.text().trim();
            const href = a.attr('href');
            const dateText = li.find('span').text().trim();
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
        title: `西安工程大学研究生招生信息网 - ${typeName}`,
        link: pageUrl,
        item: items,
    };
}

module.exports = handler;
