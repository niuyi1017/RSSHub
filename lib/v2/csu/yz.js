const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yz.csu.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace('-', '/');
    const pageUrl = `${host}/${type}.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.inside-location a').last().text() || '研究生院';
    const list = $('.art-body div[style="background-color: #f2f8fc;"]');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            // const itemDate = item.find('.time').text().slice(3, 13);
            const itemDateYYYYMM = item.find('.date_yearly').text().trim();
            const itemDateDD = item.find('.date_day').text().trim();
            const itemDate = `${itemDateYYYYMM}/${itemDateDD}`;
            const aTag = item.find('.listnews');
            const itemTitle = aTag.attr('title') || aTag.text().trim();
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
                    const content = $('.v_news_content');
                    if (content.length > 0) {
                        description = content.html().trim();
                    }
                    const attachments = $('ul[style="list-style-type:none;"]');
                    if (attachments.length > 0) {
                        description += attachments.html().trim();
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
        title: `中南大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `中南大学研究生院 - ${typeName}`,
        item: items,
    };
};
