const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://www.muhn.edu.cn',
  typeName: '招生信息网',
  feedTitle: (typeName) => `海南医科大学招生信息网 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/zsw/${type}.htm`,
  typeNameSelector: '.listMainHead_left h2',
  listSelector: 'ul.listData li',
  listParser: { dateSelector: 'time', dateTransform: (d) => d.replace(/[年月]/g, '/').replace(/日/g, '') },
  fetchDetail: true,
  detailContentSelector: '.v_news_content',
  detailExtraSelectors: ['ul[style="list-style-type:none;"]'],
});
