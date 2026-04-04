const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yjsc.lzjtu.edu.cn',
  typeName: '公告通知',
  feedTitle: (typeName) => `兰州交通大学研究生院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  fetchMethod: 'puppy',
  typeNameSelector: '.columnname h3',
  listSelector: '.list_information .information > li',
  listParser: { dateSelector: 'h5' },
  fetchDetail: true,
  detailFetchMethod: 'puppy',
  detailContentSelector: '#vsb_content .v_news_content',
});
