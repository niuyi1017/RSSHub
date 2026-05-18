const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yjsxy.sdpei.edu.cn',
  typeName: '招生工作',
  feedTitle: (typeName) => `山东体育学院研究生教育学院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/news-list-${type}.html`,
  typeNameSelector: '.now a:last',
  listSelector: '#newslist_title ul li',
  fetchDetail: true,
  detailContentSelector: 'div[style*="border-top:3px solid #1d89c5"]',
});
