const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://www.chinacdc.cn',
  typeName: '招生资讯',
  feedTitle: (typeName) => `中国疾病预防控制中心研究生院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/jypx/yjsy/${type}/`,
  typeNameSelector: '.erjiCurNav span',
  listSelector: 'ul.xw_list > li',
  listItemParser: ($item, $, pageUrl) => {
    const a = $item.find('a').first();
    const date = a.find('span').text().trim();
    const link = new URL(a.attr('href'), pageUrl).href;
    const title = a
      .clone()
      .find('span')
      .remove()
      .end()
      .text()
      .trim();

    return {
      title,
      link,
      date,
    };
  },
  fetchDetail: true,
  detailContentSelector: '.TRS_Editor',
});
