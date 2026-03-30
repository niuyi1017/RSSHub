const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yjsc.xiyi.edu.cn',
  typeName: '通知公告',
  feedTitle: (typeName) => `西安医学院研究生处 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.list_p_box',
  listSelector: '.info_list_con ul li',
  listParser: { dateSelector: '.time' },
  fetchDetail: true,
  detailContentSelector: '.v_news_content',
});
