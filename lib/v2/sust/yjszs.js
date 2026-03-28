const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yjszs.sust.edu.cn',
  typeName: '研究生招生信息网',
  feedTitle: (typeName) => `陕西科技大学研究生招生信息网 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '#cltop .titlestyle71566',
  listSelector: '#crmain table tr',
  listItemParser: ($item, $, pageUrl) => {
    const aTag = $item.find('a');
    const itemTitle = aTag.attr('title') || aTag.text();
    const itemPath = aTag.attr('href');
    const itemUrl = itemPath && itemPath.startsWith('http') ? itemPath : itemPath ? new URL(itemPath, pageUrl).href : '';
    const dateText = $item.find('td:last-child').text().trim();
    const dateMatch = dateText.match(/(\d{4})年(\d{2})月(\d{2})日/);
    const itemDate = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : dateText;
    return { title: itemTitle, link: itemUrl, date: itemDate };
  },
  fetchDetail: true,
  detailContentSelector: '.v_news_content',
});
