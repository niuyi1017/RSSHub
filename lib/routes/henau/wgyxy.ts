import { load } from 'cheerio';
import iconv from 'iconv-lite';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const host = 'https://wgyxy.henau.edu.cn';

const gbk2utf8 = (s: Buffer) => iconv.decode(s, 'gbk');

export const route: Route = {
    path: '/wgyxy/:type?',
    categories: ['university'],
    example: '/henau/wgyxy/42',
    parameters: { type: '默认为`42`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '外国语学院',
    maintainers: ['niuyi1017'],
    handler,
    description: `| 通知公告 |
| -------- |
| tzgg     | `,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? '42';
    const pageUrl = `${host}/plus/list.php?tid=${type}`;

    const response = await got(pageUrl, {
        responseType: 'buffer',
    });
    const $ = load(gbk2utf8(response.data));
    const typeName = $('.second_main .list_l  a.cur').text() || '外国语学院';
    let list = $('.second_main .list_r .list_box ul')
        .first()
        .find('li')
        .toArray()
        .map((element) => {
            const $element = $(element);
            const itemDate = $element.find('.datatime').text();
            const aTag = $element.find('a');
            const title = aTag.attr('title') || aTag.text().trim();
            const itemPath = aTag.attr('href') ?? '';
            const link = itemPath.startsWith('http') ? itemPath : new URL(itemPath, pageUrl).href;
            return {
                title,
                link,
                pubDate: parseDate(itemDate),
            };
        });

    list = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link, {
                    responseType: 'buffer',
                });
                const $ = load(gbk2utf8(response.data));

                const content = $('.content_box .content');
                let description = '';
                if (content.length > 0) {
                    description = content.html()?.trim() ?? '';
                }
                const attachments = $('ul[style="list-style-type:none;"]');
                if (attachments.length > 0) {
                    description += attachments.html()?.trim() ?? '';
                }
                return {
                    ...item,
                    description,
                };
            })
        )
    );

    return {
        title: `河南农业大学外国语学院 - ${typeName}`,
        description: $('title').text(),
        link: pageUrl,
        item: list,
    };
}
