const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://marxism.jiangnan.edu.cn',
  typeName: '马克思主义学院',
  feedTitle: (typeName) => `江南大学马克思主义学院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.coum_title H3',
  listSelector: '.list_content li',
  listParser: { dateSelector: 'span.contime', dateTransform: (d) => d.replace(/[()]/g, '') },
  fetchDetail: true,
  detailContentSelector: '.v_news_content',
});
