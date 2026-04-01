const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yjsc.gsupl.edu.cn',
  typeName: '硕士招生',
  feedTitle: (typeName) => `甘肃政法大学研究生工作处 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  fetchMethod: 'puppy',
  typeNameSelector: '.dqwz a:last',
  listSelector: '.list ul li',
  listItemParser: ($item, $, pageUrl) => {
    const day = $item.find('.time p').eq(0).text().trim();
    const yearMonth = $item.find('.time p').eq(1).text().trim();
    const aTag = $item.find('a').eq(0);

    return {
      title: aTag.attr('title') || aTag.find('h2').text().trim(),
      link: new URL(aTag.attr('href'), pageUrl).href,
      date: `${yearMonth}-${day}`,
    };
  },
  fetchDetail: true,
  detailFetchMethod: 'puppy',
  detailContentSelector: '#vsb_content',
});
