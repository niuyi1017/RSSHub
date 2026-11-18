const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://zsb.jlu.edu.cn';
const graduateHost = 'https://yzb.jlu.edu.cn';
const graduateLists = ['zsgg', 'zsjz', 'fsx', 'lqgs'];

// The current graduate admissions site republishes these entries under new URLs.
// Preserve the original RSS GUID while linking readers to the current article.
const graduateLegacyIds = {
    '/info/1046/2913.htm': 3220,
    '/info/1046/2914.htm': 3196,
    '/info/1046/2915.htm': 3193,
    '/info/1046/2916.htm': 3186,
    '/info/1046/2917.htm': 3180,
    '/info/1046/2918.htm': 3177,
    '/info/1046/2919.htm': 3175,
    '/info/1046/2921.htm': 3161,
    '/info/1047/2924.htm': 3174,
    '/info/1047/2943.htm': 3176,
    '/info/1047/2944.htm': 3173,
    '/info/1048/2941.htm': 3195,
    '/info/1049/2931.htm': 3218,
    '/info/1049/2932.htm': 3199,
    '/info/1049/2933.htm': 3178,
};

const getGraduateFeed = async (ctx) => {
    const lists = await Promise.all(
        graduateLists.map(async (section) => {
            const pageUrl = `${graduateHost}/sszs/${section}.htm`;
            const { data } = await got(pageUrl);
            const $ = cheerio.load(data);
            const items = $('ul.txtList > li > a[href]')
                .toArray()
                .flatMap((element) => {
                    const anchor = $(element);
                    const title = (anchor.attr('title') || anchor.find('h4').text()).trim();
                    const date = anchor.find('time').text().trim().match(/^(\d{1,2})\s*(\d{4})\.(\d{2})$/);
                    if (!title || !date) {
                        return [];
                    }

                    const [, day, year, month] = date;
                    const url = new URL(anchor.attr('href'), pageUrl);
                    const legacyId = graduateLegacyIds[url.pathname];
                    const pubDate = new Date(`${year}-${month}-${day.padStart(2, '0')}T00:00:00+08:00`);
                    return [{ title, link: url.href, guid: legacyId ? `${host}/info/${legacyId}.html` : url.href, pubDate }];
                });

            if (!items.length) {
                throw new Error(`吉林大学硕士招生栏目未返回有效条目: ${section}`);
            }
            return items;
        })
    );
    const entries = [...new Map(lists.flat().map((item) => [item.link, item])).values()].sort((a, b) => b.pubDate - a.pubDate).slice(0, 15);
    const item = await Promise.all(
        entries.map(async (entry) => {
            const description = await ctx.cache.tryGet(`jlu:zsb:graduate-description:${entry.link}`, async () => {
                try {
                    const { data } = await got(entry.link);
                    return cheerio.load(data)('#vsb_content').html()?.trim();
                } catch {
                    // List metadata remains available when an individual article fails.
                }
            });
            return { ...entry, description: description || entry.title };
        })
    );
    const title = '吉林大学招生网 - 硕士';
    return { title, link: `${graduateHost}/sszs/zsgg.htm`, description: title, item };
};

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    if (type === '18') {
        ctx.state.data = await getGraduateFeed(ctx);
        return;
    }
    type = type.replace('-', '/');
    const pageUrl = `${host}/list/${type}.htm`;
    const response = await got(pageUrl, { https: { rejectUnauthorized: false } });
    const $ = cheerio.load(response.data);
    const typeName = $('.location a').last().text() || '招生网';
    const list = $('.newslist li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('span').text();
            const itemTitle = item.find('a').attr('title');
            const itemPath = item.find('a').attr('href');
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
                    if ($('.content-info-text').length > 0) {
                        description = $('.content-info-text').html().trim();
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
        title: `吉林大学招生网 - ${typeName}`,
        link: pageUrl,
        description: `吉林大学招生网 - ${typeName}`,
        item: items,
    };
};
