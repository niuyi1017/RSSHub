const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yjs.qfnu.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/${type}.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.zj h3').text() || '研究生教育';
    const list = $('.text-list ul li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDateDD = item.find('time span').text();
            const itemDateYYYYMM = item.find('time').text();
            const itemDate = `${itemDateYYYYMM.replace(itemDateDD, '')}-${itemDateDD}`;

            const aTag = item.find('a');
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
                    const content = $('#vsb_content');
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
        title: `曲阜师范大学研究生教育 - ${typeName}`,
        link: pageUrl,
        description: `曲阜师范大学研究生教育 - ${typeName}`,
        item: items,
    };
};
