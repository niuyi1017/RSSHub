const cheerio = require('cheerio');
const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://yzb.hit.edu.cn';
const graduateAnnouncements = 'https://yzb.hit.edu.cn/ssgg_22276/list.htm';

const loadGraduateAnnouncements = async () => {
    const { data } = await got(graduateAnnouncements);
    const $ = cheerio.load(data);
    const item = $('.mzw-list1 > li > a.con[href]')
        .toArray()
        .flatMap((element) => {
            const article = $(element);
            const title = article.find('.txt .tit').text().trim();
            const yearMonth = article.find('.date .year').text().trim();
            const day = article.find('.date .day').text().trim().padStart(2, '0');
            const pubDate = new Date(`${yearMonth}-${day}T00:00:00+08:00`);
            if (!title || Number.isNaN(pubDate.getTime())) {
                return [];
            }
            const url = new URL(article.attr('href'), graduateAnnouncements);
            const description = article.find('.txt .desc').text().trim() || title;
            const guid = url.origin === 'https://yzb.hit.edu.cn' ? `${host}${url.pathname}${url.search}` : url.href;
            return [{ title, link: url.href, guid, description, pubDate }];
        });
    const title = '哈尔滨工业大学研究生招生网 - 硕士公告';
    return { title, link: graduateAnnouncements, description: title, item };
};

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    if (type === '8822') {
        ctx.state.data = await loadGraduateAnnouncements();
        return;
    }
    type = type.replace(/-/gi, '/');
    const pageUrl = `${host}/${type}/list.htm`;
    const browser = await require('@/utils/puppeteer')({ stealth: true });
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
    });
    await page.goto(pageUrl, {
        waitUntil: 'networkidle2',
    });
    const content = await page.content();
    await browser.close();

    const $ = cheerio.load(content);
    const typeName = $('.col_metas  a').last().text() || '研究生招生网';
    const list = $('.col_news_box .news_list .news');

    const items = Array.from(list).map((item) => {
        item = $(item);
        const itemDate = `${item.find('.news_days').text()}-${item.find('news_year').text()}`;
        const aTag = item.find('.news_title a');
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
            description: itemTitle,
            pubDate: timezone(parseDate(itemDate), 8),
        };
    });

    ctx.state.data = {
        title: `哈尔滨工业大学研究生招生网 - ${typeName}`,
        link: pageUrl,
        description: `哈尔滨工业大学研究生招生网 - ${typeName}`,
        item: items,
    };
};
