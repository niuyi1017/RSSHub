const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://zs.gzarts.edu.cn',
  typeName: '研究生招生',
  feedTitle: (typeName) => `广州美术学院招生考试中心 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.location a:last-child',
  listSelector: '.content-area ul li.c-item',
  listItemParser: ($item, $, pageUrl) => {
    const a = $item.find('> div:first-child a');
    return {
      title: a.find('.title').text().trim(),
      link: new URL(a.attr('href'), pageUrl).href,
      date: $item.find('.date').text().trim(),
    };
  },
  fetchDetail: true,
  detailContentSelector: '.v_news_content',
  detailExtraSelectors: ['ul[style="list-style-type:none;"]'],
});
