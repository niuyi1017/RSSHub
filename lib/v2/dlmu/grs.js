const got = require('@/utils/got');
const cheerio = require('cheerio');
// const crypto = require('crypto');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://grs.dlmu.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/${type}.htm`;

    // const agent = new https.Agent({
    //     rejectUnauthorized: false,
    //     secureOptions: crypto.constants.SSL_OP_NO_TLSv1,
    // });

    const response = await got(pageUrl, {
        https: {
            rejectUnauthorized: false,
            secureOptions: require('constants').SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION,
        },
    });

    const $ = cheerio.load(response.data);
    const typeName = $('.sider_nav li.on').text() || '研究生院';
    const list = $('.listNr .n_bt ul li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('i').text();
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
                        https: {
                            rejectUnauthorized: false,
                            secureOptions: require('constants').SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION,
                        },
                    });

                    const $ = cheerio.load(result.data);
                    const content = $('#vsb_content');
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
        title: `大连海事大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `大连海事大学研究生院 - ${typeName}`,
        item: items,
    };
};
