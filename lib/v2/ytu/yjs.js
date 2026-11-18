const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yjs.ytu.edu.cn';
module.exports = async (ctx) => {
    const type = ctx.request.params.type.replace(/-/g, '/');
    const admissions = type === 'zsgz';
    const pageUrl = admissions ? `${host}/` : `${host}/${type}.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = admissions ? '招生工作' : $('.mbx').text() || $('.gp-subRight .articleTitle h2').text().trim() || '研究生处';
    // The site keeps current master's and doctoral admissions together in this homepage tab.
    const list = admissions
        ? $('#container-1 .tab-con.c1 .news_list > li:has(.news_title a[href])')
        : $('.gp-subRight .newlist > ul > li:has(a[href]), .ny1 ul.list li:has(a[href])');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const aTag = item.find('a[href]').first();
            const itemPath = aTag.attr('href');
            const itemDate = item.find('.news_meta, span.date, div[style="float:right; font-size:11px"]').first().text().trim().replace(/\./g, '-');
            const itemTitle = (aTag.attr('title') || aTag.find('h1, div[style="float:left"]').text() || aTag.text()).replace('⊙', '').trim();
            const url = new URL(itemPath, pageUrl);
            const itemUrl = url.href;
            return ctx.cache.tryGet(itemUrl, async () => {
                let description = itemTitle;
                try {
                    if (url.origin === host) {
                        const result = await got(itemUrl);
                        const $ = cheerio.load(result.data);
                        description = $('#vsb_content').first().html()?.trim() || $('.v_news_content').first().html()?.trim() || itemTitle;
                    }
                } catch (e) {
                    description = itemTitle;
                }
                return {
                    title: itemTitle,
                    link: itemUrl,
                    pubDate: timezone(parseDate(itemDate), 8),
                    description,
                };
            });
        })
    );
    ctx.state.data = {
        title: `烟台大学研究生处 - ${typeName}`,
        link: pageUrl,
        description: `烟台大学研究生处 - ${typeName}`,
        item: items,
    };
};
