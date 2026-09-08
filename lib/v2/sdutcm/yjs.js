const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yjs.sdutcm.edu.cn';
const { createRoute } = require('@/v2/utils/news-list-template');
const admissions = createRoute({
    admission: true,
    host,
    typeName: '硕士招生',
    feedTitle: (typeName) => `山东中医药大学研究生招生信息网 - ${typeName}`,
    typePreprocess: (type) => (type === 'zsgz' ? 'zsgz/sszs/tz' : type.replace(/-/g, '/')),
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    listSelector: '#list li',
    fetchDetail: true,
    detailContentSelector: '.v_news_content',
    detailExtraSelectors: ['ul[style="list-style-type:none;"]'],
});
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    if (type === 'zsgz' || type.startsWith('zsgz-')) {
        return admissions(ctx);
    }
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/${type}.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.biaoTi span').first().text() || '研究生处';
    const list = $('.ss1 li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const aTag = item.find('a');
            const itemDate = item.find('span').text();
            const itemTitle = aTag.attr('title') || aTag.text();
            const itemPath = aTag.attr('href');
            let itemUrl = '';
            if (itemPath.startsWith('http')) {
                itemUrl = itemPath;
            } else {
                itemUrl = new URL(itemPath, pageUrl).href;
            }
            return ctx.cache.tryGet(itemUrl, async () => {
                let description = itemTitle;
                try {
                    const result = await got(itemUrl);
                    const $ = cheerio.load(result.data);
                    const content = $('#vsb_content .v_news_content');
                    if (content.length > 0) {
                        description = content.html().trim();
                        const attachments = $('ul[style="list-style-type:none;"]');
                        if (attachments.length > 0) {
                            description += attachments.html().trim();
                        }
                    } else {
                        description = itemTitle;
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
        title: `山东中医药大学研究生处 - ${typeName}`,
        link: pageUrl,
        description: `山东中医药大学研究生处 - ${typeName}`,
        item: items,
    };
};
