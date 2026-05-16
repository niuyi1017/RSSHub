const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://www.cyu.edu.cn',
  typeName: '招生公告',
  feedTitle: (typeName) => `中国青年政治学院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}/index.html`,
  typeNameSelector: '.notice1 .title .fz30',
  listSelector: '.notice1 .list .item',
  listItemParser: ($item, $, pageUrl) => {
    const a = $item.find('a').first();
    const itemTitle = a.find('.fz16').text().trim();
    const itemDate = a.find('.data').text().trim();
    const itemPath = a.attr('href');
    let itemUrl = '';
    if (itemPath && itemPath.startsWith('http')) {
      itemUrl = itemPath;
    } else if (itemPath) {
      itemUrl = new URL(itemPath, pageUrl).href;
    }
    return {
      title: itemTitle,
      link: itemUrl,
      date: itemDate,
    };
  },
  fetchDetail: true,
  detailContentSelector: '.cont.dochtmlcon',
});
