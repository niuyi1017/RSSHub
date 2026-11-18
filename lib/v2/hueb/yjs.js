const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { rootCertificates } = require('node:tls');

const host = 'https://yjs.hueb.edu.cn';
// The site sends only its leaf certificate. Supply the issuer from DigiCert's AIA endpoint.
const gotOptions = {
    https: {
        certificateAuthority: [...rootCertificates, readFileSync(join(__dirname, 'geotrust-g2-cn.pem'))],
        rejectUnauthorized: true,
    },
};

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/${type}.htm`;
    const response = await got(pageUrl, gotOptions);
    const $ = cheerio.load(response.data);
    const typeName = $('.abr_top p').text() || '研究生院';
    const list = $('.mian-box-con ul li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('.addtime').text();
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
                    const result = await got(itemUrl, new URL(itemUrl).origin === host ? gotOptions : undefined);
                    const $ = cheerio.load(result.data);
                    if ($('#vsb_content').length > 0) {
                        description = $('#vsb_content').html().trim();
                        if ($('ul[style="list-style-type:none;"]').length > 0) {
                            description += $('ul[style="list-style-type:none;"]').html().trim();
                        }
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
        title: `河北经贸大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `河北经贸大学研究生院 - ${typeName}`,
        item: items,
    };
};
