const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://muchong.com';
module.exports = async (ctx) => {
    const pageUrl = `${host}/f-430-1-typeid-2304`;
    const response = await got(pageUrl, {
        responseType: 'buffer',
        headers: {
            Referer: host,
        },
    });

    const data = iconv.decode(response.data, 'gbk');

    const $ = cheerio.load(data);
    const typeName = '硕士招生';
    const list = $('.xmc_bpt .forum_list');
    const listArray = Array.from(list).slice(0, 20);
    const items = await Promise.all(
        listArray.map((item) => {
            item = $(item);
            const itemDate = item.find('.by').first().find('.xmc_b9').text();
            const aTag = item.find('a.a_subject');
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
                    const preContent = $('table.adjust_table tr');
                    if (preContent.length > 0) {
                        description = `
                        <table>
                            <tr>
                                <td>${preContent.eq(1).text()}</td>
                            </tr>
                            <tr>
                                <td>${preContent.eq(2).text()}</td>
                            </tr>
                            <tr>
                                <td>${preContent.eq(3).text()}</td>
                            </tr>
                            <tr>
                                <td>${preContent.eq(4).text()}</td>
                            </tr>
                        </table> <br><br>`;
                    }

                    const content = $('.t_fsz td[valign="top"]');
                    if (content.length > 0) {
                        description += content.html().trim();
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
