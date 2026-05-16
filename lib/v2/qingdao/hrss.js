const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://hrss.qingdao.gov.cn',
  typeName: '招聘简章',
  feedTitle: (typeName) => `青岛市人力资源和社会保障局 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}/`,
  typeNameSelector: 'h1.zcbt p',
  listSelector: '.listChangeDiv a',
  limit: 20,
  listItemParser: ($item, $, pageUrl) => {
    const title = $item.attr('title') || $item.find('span').text().trim();
    const href = $item.attr('href') || '';
    const link = href.startsWith('http') ? href : new URL(href, pageUrl).href;
    const date = $item.find('em').text().replace(/[【】]/g, '').trim();
    return { title, link, date };
  },
  fetchDetail: true,
  detailContentSelector: '.trs_editor_view',
});
