const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { createRoute } = require('@/v2/utils/news-list-template');

const host = 'http://graduate.nbu.edu.cn';

const mastersAdmissionsRoute = createRoute({
    host: 'https://graduate.nbu.edu.cn',
    typeName: '硕士生招生',
    feedTitle: (typeName) => `宁波大学研究生院 - ${typeName.trim()}`,
    buildPageUrl: (site, type) => `${site}/${type}.htm`,
    fetchMethod: 'puppy',
    typeNameSelector: '.page-title',
    listSelector: '#main .inner-post .entry-header',
    listParser: {
        linkSelector: 'h4 a',
        dateSelector: '.posted-on',
    },
    fetchDetail: true,
    detailFetchMethod: 'puppy',
    detailContentSelector: '.v_news_content',
});

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    if (type === 'zsgz-ssszs') {
        await mastersAdmissionsRoute(ctx);
        for (const item of ctx.state.data.item) {
            item.title = item.title.trim();
            if (item.link.startsWith('https://graduate.nbu.edu.cn/info/')) {
                // Keep the stored HTTP GUID when the university switches article links to HTTPS.
                item.guid = item.link.replace(/^https:/, 'http:');
            }
        }
        return;
    }

    type = type.replace('-', '/');
    const pageUrl = `${host}/${type}.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.page-title').first().text() || '研究生院';
    const list = $('#main .inner-post .entry-header');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('.posted-on').text();
            const itemTitle = item.find('a').attr('title');
            const itemPath = item.find('a').attr('href');
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
                    if ($('.v_news_content').length > 0) {
                        description = $('.v_news_content').html().trim();
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
        title: `湖南师范大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `湖南师范大学研究生院 - ${typeName}`,
        item: items,
    };
};
