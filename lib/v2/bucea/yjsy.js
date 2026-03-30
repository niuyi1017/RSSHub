const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yjsy.bucea.edu.cn',
  typeName: '通知公告',
  feedTitle: (typeName) => `北京建筑大学研究生院 - ${typeName}`,
  typeNameSelector: '.gp-title15 h2 a',
  listSelector: '.page-list18 ul li',
  listItemParser: ($item, $, pageUrl) => {
    const a = $item.find('a.gpTextArea');
    const title = a.find('p.gpArticleTitle').text().trim();
    const date = a.find('.gpArticleDate').text().trim();
    const href = a.attr('href');
    const link = href && href.startsWith('http') ? href : new URL(href, pageUrl).href;
    return { title, link, date };
  },
  fetchDetail: true,
  detailContentSelector: '.gp-article1',
  detailExtraSelectors: ['.gp-annex2'],
});
