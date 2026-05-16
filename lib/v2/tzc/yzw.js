const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yzw.tzc.edu.cn',
  typeName: '通知公告',
  feedTitle: (typeName) => `台州学院研究生招生网 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.main-region .column h3',
  listSelector: '.list ul li',
  listParser: {
    dateSelector: 'span.date',
    linkSelector: 'a.title',
    titleAttr: 'title',
  },
  fetchDetail: true,
  detailContentSelector: '#vsb_content',
});
