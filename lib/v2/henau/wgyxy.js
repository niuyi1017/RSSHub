const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://wgyxy.henau.edu.cn',
  typeName: '外国语学院',
  feedTitle: (typeName) => `河南农业大学外国语学院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/plus/list.php?tid=${type}`,
  typePreprocess: (type) => type,
  typeNameSelector: '.list_l a.cur',
  listSelector: '.list_box ul li',
  listParser: { dateSelector: 'span.datetime' },
  encoding: 'gb2312',
  fetchDetail: true,
  detailContentSelector: '.content',
});
