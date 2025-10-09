const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://yjs.syu.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/${type}.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.sub_nav_title').text() || '研究生院';
    const list = $('.list_main .ilistfy ul li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDateDD = item.find('span i').text();
            const itemDate = item.find('span').text().slice(2) + '-' + itemDateDD;
            const aTag = item.find('a');
            const itemTitle = aTag.attr('title') || aTag.text();
            const itemPath = aTag.attr('href');
            let itemUrl = '';
            if (itemPath.startsWith('http')) {
                itemUrl = itemPath;
            } else {
                itemUrl = new URL(itemPath, pageUrl).href;
            }

            return {
                title: itemTitle,
                link: itemUrl,
                pubDate: timezone(parseDate(itemDate), 8),
                description: itemTitle,
            };
        })
    );
    ctx.state.data = {
        title: `沈阳大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `沈阳大学研究生院 - ${typeName}`,
        item: items,
    };
};
