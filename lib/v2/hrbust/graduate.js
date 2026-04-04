const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://graduate.hrbust.edu.cn',
  typeName: '工作动态',
  feedTitle: (typeName) => `哈尔滨理工大学研究生处 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}/list.htm`,
  typeNameSelector: '.col_title h2',
  listSelector: '.news_list.list2 li',
  listParser: {
    dateSelector: '.news_meta',
  },
  fetchDetail: true,
  detailContentSelector: '.wp_articlecontent',
});
