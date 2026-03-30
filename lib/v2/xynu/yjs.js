const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'http://yjs.xynu.edu.cn',
  typeName: '最新消息',
  feedTitle: (typeName) => `信阳师范大学研究生院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.bx2 dt strong',
  listSelector: 'ul.lst li',
  listItemParser: ($item, $, pageUrl) => {
    const a = $item.find('a');
    const title = a.text().trim();
    const date = $item.find('span').first().text().trim();
    const href = a.attr('href');
    const link = href && href.startsWith('http') ? href : new URL(href, pageUrl).href;
    return { title, link, date };
  },
  fetchDetail: true,
  detailContentSelector: '.article',
});
