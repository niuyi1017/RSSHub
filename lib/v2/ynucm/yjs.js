const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yjs.ynucm.edu.cn',
  typeName: '硕士',
  feedTitle: (typeName) => `云南中医药大学研究生处 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.channl-menu h2',
  listSelector: '.text-list ul li',
  listItemParser: ($item, $, pageUrl) => {
    const a = $item.find('a');
    const title = $item.find('.text-linfo h3').text().trim();
    const monthDay = $item.find('.text-ldata p').text().trim();
    const year = $item.find('.text-ldata span').text().trim();
    const date = monthDay && year ? `${year}-${monthDay.replace('/', '-')}` : '';
    const href = a.attr('href');
    const link = href && href.startsWith('http') ? href : new URL(href, pageUrl).href;
    return { title, link, date };
  },
  fetchDetail: true,
  detailContentSelector: '#vsb_content',
});
