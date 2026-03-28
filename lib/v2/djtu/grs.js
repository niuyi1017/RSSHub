const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://grs.djtu.edu.cn',
  encoding: 'gb2312',
  typeName: '研究生招生复试与调剂',
  feedTitle: () => '大连交通大学 - 研究生招生复试与调剂',
  typePreprocess: () => '',
  buildPageUrl: (host) => `${host}/web/news/news.asp`,
  listSelector: 'a[style="font-size:16px;"]',
  listItemParser: ($item, $, pageUrl) => {
    const title = $item.text();
    const dateText = $item
      .parent()
      .find('font[color="#999999"]')
      .text()
      .replace(/[\[\]]/g, '')
      .trim();
    const itemPath = $item.attr('href');
    const link = itemPath && itemPath.startsWith('http') ? itemPath : new URL(itemPath, pageUrl).href;
    return { title, link, date: dateText };
  },
  fetchDetail: true,
  detailContentSelector: 'td[colspan="2"][valign="top"]',
});
