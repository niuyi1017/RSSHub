const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const titleName = `广州医科大学研究生院`;
const host = 'https://yjs.gzhmu.edu.cn';
const getPageUrl = (type) => `${host}/${type}.htm`;
const listSlector = 'table.lt tr';
const contantSlector = '#vsb_content';

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = getPageUrl(type);
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.pt').text() || '研究生院';
    const list = $(listSlector);
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            let itemDate = new Date();
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
                    itemDate = $('#date').text().replace('发布时间：', '').replace('&emsp;&emsp;').trim().slice(0, 10);
                    const content = $(contantSlector);
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
        title: `${titleName} - ${typeName}`,
        link: pageUrl,
        description: `${titleName} - ${typeName}`,
        item: items,
    };
};
