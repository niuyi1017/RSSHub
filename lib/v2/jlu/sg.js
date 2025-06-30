const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://sg.jlu.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace('-', '/');
    const pageUrl = `${host}/${type}.htm`;
    const response = await got(pageUrl, { https: { rejectUnauthorized: false } });
    const $ = cheerio.load(response.data);
    const typeName = $('.place h3').last().text() || '商学与管理学院';
    const list = $('.list2 li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            let itemDate = item.find('.date').text();
            itemDate = itemDate.slice(2) + '/' + itemDate.slice(0, 2);
            const aTag = item.find('a');
            const itemTitle = aTag.attr('title') || aTag.find('.title').text();
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
                    const result = await got(itemUrl, { https: { rejectUnauthorized: false } });
                    const $ = cheerio.load(result.data);
                    const content = $('.content');
                    if (content.length > 0) {
                        description = content.html().trim();
                    }
                    // 处理附件
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
        title: `吉林大学商学与管理学院 - ${typeName}`,
        link: pageUrl,
        description: `吉林大学商学与管理学院 - ${typeName}`,
        item: items,
    };
};
