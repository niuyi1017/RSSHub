const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yjs.syty.edu.cn',
  typeName: '通知公告',
  feedTitle: (typeName) => `沈阳体育学院研究生院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.title h2',
  listSelector: 'td.list div.media',
  listItemParser: ($item, $, pageUrl) => {
    const a = $item.find('a').first();
    const itemTitle = (a.attr('title') || a.find('h4.media-heading').text()).trim();
    const dateText = a.find('span.date').text();
    const m = dateText.match(/(\d{4}-\d{2}-\d{2})/);
    const itemDate = m ? m[1] : '';
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
  detailContentSelector: '#vsb_content',
});
