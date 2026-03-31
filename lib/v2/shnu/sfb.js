const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://sfb.shnu.edu.cn',
  typeName: '学院公告',
  feedTitle: (typeName) => `上海师范大学商学院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}/list.htm`,
  typeNameSelector: '.col_head',
  listSelector: '.news_list li',
  listParser: {
    dateSelector: '.news_time',
    linkSelector: '.news_title a',
  },
  fetchDetail: true,
  detailContentSelector: '.wp_articlecontent',
});
