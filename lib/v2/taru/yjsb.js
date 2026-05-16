const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yjsb.taru.edu.cn',
  typeName: '通知公告',
  feedTitle: (typeName) => `塔里木大学研究生处 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.cont_l a.current',
  listSelector: '.cont_r > dd',
  listItemParser: ($item, $, pageUrl) => {
    const aTag = $item.find('a');
    const itemPath = aTag.attr('href');

    return {
      title: aTag.attr('title') || aTag.text(),
      link: new URL(itemPath, pageUrl).href,
      date: $item.find('span').first().text().replace(/\s+/g, '').replace(/[年月]/g, '/').replace(/日/g, ''),
    };
  },
  fetchDetail: true,
  detailContentSelector: '#vsb_content',
});
