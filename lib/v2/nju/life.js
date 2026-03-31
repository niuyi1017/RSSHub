const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://life.nju.edu.cn',
  typeName: '研究生招生',
  feedTitle: (typeName) => `南京大学生命科学学院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}/list.htm`,
  typeNameSelector: '.col_title h2',
  listSelector: '.news_list li',
  listParser: {
    dateSelector: '.news_meta',
    linkSelector: '.news_title a',
  },
  fetchDetail: true,
  detailContentSelector: '.wp_articlecontent',
});
