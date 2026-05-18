const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://xtbg.cas.cn',
  typeName: '招生信息',
  feedTitle: (typeName) => `中国科学院西双版纳热带植物园 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/2022/${type}/index.html`,
  typeNameSelector: '.body_weizhi a:last-of-type',
  listSelector: '.nei_quanwen > a.nei_quanwen_li',
  listItemParser: ($item, $, pageUrl) => {
    const itemTitle = $item.find('p').first().text().trim();
    const itemDate = $item.find('span').first().text().trim();
    const itemPath = $item.attr('href');
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
  detailContentSelector: '.info_div_content',
});
