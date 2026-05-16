const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://hrss.zibo.gov.cn',
  typeName: '事业单位招聘',
  feedTitle: (typeName) => `淄博市人力资源和社会保障局 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}/index.html`,
  typeNameSelector: 'title',
  fetchMethod: 'puppy',
  listSelector: '.lm_right_list ul li',
  limit: 20,
  listItemParser: ($item, $, pageUrl) => {
    const a = $item.find('a');
    const title = a.attr('title') || a.text().trim();
    const href = a.attr('href') || '';
    const link = href.startsWith('http') ? href : new URL(href, pageUrl).href;
    const date = $item.find('span').text().trim();
    return { title, link, date };
  },
  fetchDetail: true,
  detailContentSelector: '#zoom',
});
