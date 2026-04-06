const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://ges.lnpu.edu.cn',
  typeName: '招生工作',
  feedTitle: (typeName) => `辽宁石油化工大学研究生院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.bread .br-l .windowstyle248639',
  listSelector: '.pagearticle > div > ul > li',
  listItemParser: ($item, $, pageUrl) => {
    const links = $item.find('a');
    const aTag = links.eq(1);
    const itemTitle = aTag.attr('title') || aTag.text();
    const itemPath = aTag.attr('href');
    const dateMatch = $item.text().match(/\d{4}年\d{2}月\d{2}日/);

    return {
      title: itemTitle,
      link: itemPath ? new URL(itemPath, pageUrl).href : '',
      date: dateMatch ? dateMatch[0].replace(/[年月]/g, '/').replace(/日/g, '') : '',
    };
  },
  fetchDetail: true,
  detailContentSelector: '#vsb_content .v_news_content',
  detailExtraSelectors: ['li:has(a[href*="download.jsp"])'],
});
