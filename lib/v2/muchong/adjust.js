const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://muchong.com/bbs/kaoyan.php';
module.exports = async (ctx) => {
    const pageUrl = `${host}?action=adjust&type=1`;
    const response = await got(pageUrl, {
        responseType: 'buffer',
        headers: {
            Referer: host,
        },
    });

    const data = iconv.decode(response.data, 'gbk');

    const $ = cheerio.load(data);
    const typeName = '调剂信息';
    const list = $('tbody.forum_body_manage > tr');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('td').last().text();
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
                    const result = await got(itemUrl, {
                        responseType: 'buffer',
                        headers: {
                            Referer: pageUrl,
                        },
                    });
                    const data = iconv.decode(result.data, 'gbk');
                    const $ = cheerio.load(data);
                    const content = $('.t_fsz td[valign="top"]');
                    if (content.length > 0) {
                        description = content.html().trim();
                    }
                    const removeDomStr = [
                        `<font color="gray" class="gray_ext"><a href="http://m.muchong.com/?f=bbs&amp;w=source" class="source_client" target="_blank">发自小木虫手机客户端</a></font>`,
                        `<font color="gray" class="gray_ext"><a href="http://m.muchong.com/?f=bbs&amp;w=source" class="source_client" target="_blank">发自小木虫IOS客户端</a></font>`,
                    ];
                    removeDomStr.forEach((str) => {
                        description = description.replace(str, '');
                    });
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
        title: `小木虫调剂信息 - ${typeName}`,
        link: pageUrl,
        description: `小木虫调剂信息 - ${typeName}`,
        item: items,
    };
};
