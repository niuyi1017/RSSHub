const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yjs.wnmc.edu.cn',
  typeName: '招生专栏',
  feedTitle: (typeName) => `皖南医科大学研究生学院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.leftNav h2',
  listSelector: 'table.wp_article_list_table tr',
  fetchDetail: true,
  detailContentSelector: '.v_news_content',
  detailExtraSelectors: ['ul[style="list-style-type:none;"]'],
});
