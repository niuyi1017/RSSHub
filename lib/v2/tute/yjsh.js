const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yjsh.tute.edu.cn',
  typeName: '招生工作',
  feedTitle: (typeName) => `天津职业技术师范大学学科建设办公室 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.channl-menu h2',
  listSelector: '.text-list ul li',
  listItemParser: ($item, $, pageUrl) => {
    const a = $item.find('a');
    const title = a.text().trim();
    const date = $item.find('.dat').text().trim();
    const href = a.attr('href');
    const link = href && href.startsWith('http') ? href : new URL(href, pageUrl).href;
    return { title, link, date };
  },
  fetchDetail: true,
  detailContentSelector: '#vsb_content',
});
