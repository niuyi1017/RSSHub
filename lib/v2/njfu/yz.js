const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yz.njfu.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/${type}/`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = '研究生招生信息网';
    const script = $('#ajaxpage-template').next().next().next().find('script').text();
    const startTag = 'dataList=';
    const endTag = ';	var pagesData=';
    const startIndex = script.indexOf(startTag) + startTag.length;
    const endIndex = script.indexOf(endTag);

    const dataList = JSON.parse(script.substring(startIndex, endIndex).trim());
    const list = dataList[0].infolist;
    const items = await Promise.all(
        Array.from(list).map((item) => {
            const itemDate = item.relesetime;
            const itemTitle = item.title;
            const itemUrl = item.url;
            return ctx.cache.tryGet(itemUrl, async () => {
                let description = itemTitle;
                try {
                    const result = await got(itemUrl);
                    const $ = cheerio.load(result.data);
                    const content = $('#Right_width');
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
        title: `南京林业大学研究生招生信息网 - ${typeName}`,
        link: pageUrl,
        description: `南京林业大学研究生招生信息网 - ${typeName}`,
        item: items,
    };
};
