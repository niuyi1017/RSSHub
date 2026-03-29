const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yjs.tust.edu.cn';

/**
 * 带 cookie 验证的 got 请求（该站点 302 回自身 + set-cookie）
 */
async function fetchWithCookie(url) {
    const r1 = await got(url, { followRedirect: false, https: { rejectUnauthorized: false } });
    const cookie = r1.headers['set-cookie']?.[0]?.split(';')[0] || '';
    const r2 = await got(url, { headers: { cookie }, https: { rejectUnauthorized: false } });
    return r2.data;
}

module.exports = async (ctx) => {
    let { type } = ctx.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/${type}/`;

    const html = await fetchWithCookie(pageUrl);
    const $ = cheerio.load(html);

    const breadcrumb = $('.zuo1_btcl').text().trim();
    const parts = breadcrumb.split(/>>|>/).map((s) => s.trim()).filter(Boolean);
    const typeName = parts[parts.length - 1] || '研究生院';

    const items = [];
    $('.links table table tr').each((_, el) => {
        const $tr = $(el);
        const tds = $tr.find('td');
        if (tds.length < 3) {
            return;
        }
        const aTag = tds.eq(1).find('a');
        if (!aTag.length) {
            return;
        }
        const itemTitle = aTag.attr('title') || aTag.text().trim();
        const itemPath = aTag.attr('href');
        const itemUrl = itemPath && itemPath.startsWith('http') ? itemPath : new URL(itemPath, pageUrl).href;
        const itemDate = tds.eq(2).text().trim();

        items.push({
            title: itemTitle,
            link: itemUrl,
            date: itemDate,
        });
    });

    const result = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                let description = item.title;
                try {
                    const detailHtml = await fetchWithCookie(item.link);
                    const $d = cheerio.load(detailHtml);
                    const wznr = $d('.wznr');
                    if (wznr.length > 1) {
                        description = wznr.last().html().trim();
                    } else if (wznr.length > 0) {
                        description = wznr.html().trim();
                    }
                } catch (e) {
                    // 详情页抓取失败，使用标题
                }
                return {
                    title: item.title,
                    link: item.link,
                    pubDate: timezone(parseDate(item.date), 8),
                    description,
                };
            })
        )
    );

    ctx.state.data = {
        title: `天津科技大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `天津科技大学研究生院 - ${typeName}`,
        item: result,
    };
};
