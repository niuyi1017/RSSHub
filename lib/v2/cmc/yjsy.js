const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yjsy.cmc.edu.cn',
  typeName: '通知公告',
  feedTitle: (typeName) => `成都医学院研究生院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/list.jsp?urltype=tree.TreeTempUrl&wbtreeid=${type}`,
  typePreprocess: (type) => type,
  typeNameSelector: '.path h3 span',
  listSelector: 'div.main_conRCb ul li',
  fetchDetail: true,
  detailContentSelector: '.v_news_content',
});
