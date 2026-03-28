const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yjsy.yau.edu.cn',
  typeName: '招生动态',
  feedTitle: (typeName) => `延安大学研究生院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.local h2 span',
  listSelector: '.newlist1 ul.list li',
  listItemParser: ($item, $, pageUrl) => {
    const aTag = $item.find('a');
    const href = aTag.attr('href');
    return {
      title: aTag.find('h3').text().trim(),
      date: aTag.find('span').text().trim(),
      link: href && href.startsWith('http') ? href : href ? new URL(href, pageUrl).href : '',
    };
  },
  fetchDetail: true,
  detailContentSelector: '#vsb_content',
  detailExtraSelectors: ['ul[style="list-style-type:none;"]'],
});
