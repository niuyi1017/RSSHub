const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const yzb_base_url = 'http://yzb.tju.edu.cn/';
const repo_url = 'https://github.com/DIYgod/RSSHub/issues';

const pageType = (href) => {
    if (href === undefined) {
        return 'unknown';
    } else if (!href.startsWith('http')) {
        return 'in-site';
    }
    const url = new URL(href);
    if (url.hostname === 'yzb.tju.edu.cn') {
        return 'tju-yzb';
    } else {
        return 'unknown';
    }
};

module.exports = async (ctx) => {
    const type = ctx.params && ctx.params.type;
    let path, subtitle;

    switch (type) {
        case 'notice':
            subtitle = '校级公告';
            path = 'xwzx/zxxx/';
            break;
        case 'master':
            subtitle = '统考硕士';
            path = 'xwzx/tkss_xw/';
            break;
        case 'doctor':
            subtitle = '统考博士';
            path = 'xwzx/tkbs_xw/';
            break;
        case 'job':
            subtitle = '在职学位';
            path = 'xwzx/zzxw/';
            break;
        default:
            subtitle = '校级公告';
            path = 'xwzx/zxxx/';
    }
    let response = null;
    try {
        response = await got(yzb_base_url + path, {
            headers: {
                Referer: yzb_base_url,
            },
            responseType: 'buffer',
        });
    } catch (e) {
        // ignore error handler
        // console.log(e);
    }

    if (response === null) {
        ctx.state.data = {
            title: '天津大学研究生招生网 - ' + subtitle,
            link: yzb_base_url + path,
            description: '链接失效' + yzb_base_url + path,
            item: [
                {
                    title: '提示信息',
                    link: repo_url,
                    description: `<h2>请到<a href=${repo_url}>此处</a>提交Issue</h2>`,
                },
            ],
        };
    } else {
        const $ = cheerio.load(iconv.decode(response.data, 'gbk'));
        const list = $('.table_dian .font_10_time')
            // .slice(1, -1)
            .map((_index, item) => {
                const parent = $(item).parent().parent();
                const aTag = parent.find('a');
                const itemTitle = aTag.attr('title') || aTag.text();
                const itemDate = timezone(parseDate($(item).text().slice(2, -2), 'YYYY-MM-DD'), +8);
                const itemPath = aTag.attr('href');
                let itemUrl = '';
                if (itemPath.startsWith('http')) {
                    itemUrl = itemPath;
                } else {
                    itemUrl = new URL(itemPath, yzb_base_url + path).href;
                }
                return {
                    title: itemTitle,
                    link: itemUrl,
                    pubDate: itemDate,
                    type: pageType(itemPath),
                };
            })
            .get();

        const items = await Promise.all(
            list.map((item) => {
                switch (item.type) {
                    case 'tju-yzb':
                    case 'in-site':
                        return ctx.cache.tryGet(item.link, async () => {
                            let detailResponse = null;
                            try {
                                detailResponse = await got(item.link, { responseType: 'buffer' });
                                const content = cheerio.load(iconv.decode(detailResponse.data, 'gbk'));
                                // content('.font_18_b').remove();
                                // content('.font_grey_en').remove();
                                item.description = content('.TRS_Editor').html();
                            } catch (e) {
                                // ignore error handler
                            }
                            return item;
                        });
                    default:
                        return item;
                }
            })
        );

        ctx.state.data = {
            title: '天津大学研究生招生网 - ' + subtitle,
            link: yzb_base_url + path,
            item: items,
        };
    }
};
