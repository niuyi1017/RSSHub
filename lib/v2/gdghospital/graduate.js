const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://www.gdghospital.org.cn',
  typeName: '研究生招生',
  feedTitle: (typeName) => `广东省心血管病研究所 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.html`,
  typeNameSelector: '.subMenuList a.on',
  listSelector: '.jobList > .warpBox > ul.ul > li',
  listItemParser: ($item, $, pageUrl) => {
    const a = $item.find('a').first();
    return {
      title: a.find('.div').text().trim(),
      link: new URL(a.attr('href'), pageUrl).href,
      date: a.find('time').text().trim(),
    };
  },
  fetchDetail: true,
  detailContentSelector: '.info_txt',
});
