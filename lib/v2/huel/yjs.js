const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yjs.huel.edu.cn',
  typeName: '研究生处',
  feedTitle: (typeName) => `河南财经政法大学研究生处 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.crumbs .fontstyle1089756',
  listSelector: 'a.page-list_item',
  listItemParser: ($item, $, pageUrl) => {
    const year = $item.find('.page-list_item-time b').text().trim();
    const md = $item.find('.page-list_item-time i').text().trim();
    const title = $item.find('.page-list_item-title').text().trim();
    const href = $item.attr('href');
    const link = href && href.startsWith('http') ? href : new URL(href, pageUrl).href;
    return { title, link, date: `${year}-${md}` };
  },
  fetchDetail: true,
  detailContentSelector: '.post-content',
});
