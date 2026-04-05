const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yjsc.zzuli.edu.cn',
  typeName: '招生工作',
  feedTitle: (typeName) => `郑州轻工业大学党委研究生工作部（研究生院）- ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}/list.htm`,
  typeNameSelector: '.Column_Name',
  listSelector: "#wp_news_w3 > table > tbody > tr:has(a[target='_blank'])",
  listItemParser: ($item, $, pageUrl) => {
    const a = $item.find("a[target='_blank']").first();
    return {
      title: a.attr('title') || a.text().trim(),
      link: new URL(a.attr('href'), pageUrl).href,
      date: $item.find("div[style='white-space:nowrap']").first().text().trim(),
    };
  },
  fetchDetail: true,
  detailContentSelector: '.Article_Content',
});
