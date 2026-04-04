const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://chntheatre.edu.cn',
  typeName: '硕士研究生',
  feedTitle: (typeName) => `中央戏剧学院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/cn/recruit/${type}.html`,
  listSelector: '#datalist .item',
  listItemParser: ($item, $, pageUrl) => {
    const aTag = $item.find('a').first();
    const title = $item.find('.h').text().trim();
    const link = aTag.attr('href');
    const date = $item.find('.d').text().trim();

    return {
      title,
      link: link ? new URL(link, pageUrl).href : '',
      date,
    };
  },
  fetchDetail: true,
  detailContentSelector: '.article-cont',
});

