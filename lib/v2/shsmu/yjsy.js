const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://www.shsmu.edu.cn',
  typeName: '招生工作',
  feedTitle: (typeName) => `上海交通大学医学院研究生院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/yjsy/${type}.htm`,
  listSelector: '#s32561575_content tr',
  listItemParser: ($item, $, pageUrl) => {
    const aTag = $item.find('.link_16 a');
    const itemTitle = aTag.text().trim();
    const itemPath = aTag.attr('href');
    let itemUrl = '';
    if (itemPath && itemPath.startsWith('http')) {
      itemUrl = itemPath;
    } else if (itemPath) {
      itemUrl = new URL(itemPath, pageUrl).href;
    }
    const dateText = $item.find('span[style*="float:right"]').text().replace(/[[\]\s]/g, '');
    const parts = dateText.split('-');
    const itemDate = parts.length === 3 ? `20${parts[0]}-${parts[1]}-${parts[2]}` : dateText;
    return { title: itemTitle, link: itemUrl, date: itemDate };
  },
  fetchDetail: true,
  detailContentSelector: '#vsb_content .v_news_content',
});
