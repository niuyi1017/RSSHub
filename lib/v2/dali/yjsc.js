const { load } = require('cheerio');
const got = require('@/utils/got');
const iconv = require('iconv-lite');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const host = 'https://yjsc.dali.edu.cn';
const gotOpts = { https: { rejectUnauthorized: false }, responseType: 'buffer' };

async function fetchGB2312(url) {
    const res = await got(url, gotOpts);
    return iconv.decode(res.data, 'gb2312');
}

async function handler(ctx) {
    const catid = ctx.params.type;
    const pageUrl = `${host}/yjsh/category.asp?catid=${catid}`;

    const html = await fetchGB2312(pageUrl);
    const $ = load(html);

    const typeName = $('td.list1').first().text().trim() ||
        $('td.list').first().text().trim() ||
        '招生公告';

    const list = $('td.txt11 a')
        .toArray()
        .map((el) => {
            const a = $(el);
            const href = a.attr('href') || '';
            const idMatch = href.match(/content\.asp\?id=(\d+)/);
            const id = idMatch ? idMatch[1] : '';
            const text = a.text().trim();
            const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})/);
            const date = dateMatch ? dateMatch[1] : '';
            const title = text.replace(/\s*\(\d{4}-\d{2}-\d{2}\)\s*$/, '').trim();
            return {
                title: a.attr('title') || title,
                link: id ? `${host}/yjsh/content.asp?id=${id}` : '',
                pubDate: date ? timezone(parseDate(date), 8) : undefined,
            };
        })
        .filter((item) => item.link);

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                try {
                    const dhtml = await fetchGB2312(item.link);
                    const $d = load(dhtml);
                    item.description = $d('table.MsoNormalTable td').first().html() ||
                        $d('.txt11').html() ||
                        item.title;
                } catch {
                    item.description = item.title;
                }
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `大理大学研究生处 - ${typeName}`,
        link: pageUrl,
        item: items,
    };
}

module.exports = handler;
