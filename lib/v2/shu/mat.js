const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://mat.shu.edu.cn',
  typeName: '材料科学与工程学院',
  feedTitle: (typeName) => `上海大学材料科学与工程学院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/sycdlm/${type}.htm`,
  typeNameSelector: '.location',
  listSelector: '.listPage ul li',
  listItemParser: ($item, $, pageUrl) => {
    const aTag = $item.find('a');
    const title = aTag.find('div').text().trim();
    const date = aTag.find('span').text().trim();
    const href = aTag.attr('href');
    const link = href && href.startsWith('http') ? href : new URL(href, pageUrl).href;
    return { title, link, date };
  },
  fetchDetail: true,
  detailContentSelector: '#vsb_content',
});
