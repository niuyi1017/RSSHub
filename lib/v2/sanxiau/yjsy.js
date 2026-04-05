const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yjsy.sanxiau.edu.cn',
  typeName: '研究生处',
  feedTitle: (typeName) => `重庆三峡学院${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.penList .hd h3',
  listSelector: 'table[class^="winstyle"] tr[height="30"]',
  listParser: {
    dateSelector: 'span[class^="timestyle"]',
    linkSelector: 'a[href*="info/"]',
    titleAttr: 'title',
  },
  fetchDetail: true,
  detailContentSelector: '.v_news_content',
});
