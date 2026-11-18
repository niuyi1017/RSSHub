const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { rootCertificates } = require('node:tls');

const host = 'https://yjsxy.web.hebust.edu.cn';
// The site sends only its leaf certificate. Supply the issuer from DigiCert's AIA endpoint.
const gotOptions = {
    https: {
        certificateAuthority: [...rootCertificates, readFileSync(join(__dirname, 'digicert-basic-ov-g2-cn.pem'))],
        rejectUnauthorized: true,
    },
};

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace('-', '/');
    const pageUrl = `${host}/${type}/index.htm`;
    const response = await got(pageUrl, gotOptions);
    const $ = cheerio.load(response.data);
    const typeName = $('.subTitle h2').text() || '研究生学院';
    const list = $('.sub_list li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('.rightDate').text();
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
                    const content = $('.subArticleCon');
                    if (content.length > 0) {
                        description = content.html().trim();
                        const attachments = $('.subAffix');
                        if (attachments.length > 0) {
                            description += attachments.html().trim();
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
        title: `河北科技大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `河北科技大学研究生院 - ${typeName}`,
        item: items,
    };
};
