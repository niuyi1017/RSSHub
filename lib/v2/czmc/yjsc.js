const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'http://yjsc.czmc.edu.cn',
  typeName: '招生工作',
  feedTitle: (typeName) => `长治医学院研究生学院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.ny_left_top h2',
  listSelector: '.Newslist ul li',
  listItemParser: ($item, $, pageUrl) => {
    const a = $item.find('a');
    const title = a.text().trim();
    const date = $item.find('span').first().text().trim();
    const href = a.attr('href');
    const link = href && href.startsWith('http') ? href : new URL(href, pageUrl).href;
    return { title, link, date };
  },
  fetchDetail: true,
  detailContentSelector: '#vsb_content',
});
