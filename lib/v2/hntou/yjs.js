const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yjs.hntou.edu.cn',
  typeName: '研究生处',
  feedTitle: (typeName) => `海南热带海洋学院研究生处 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}/`,
  typeNameSelector: '.title-tit',
  listSelector: 'ul.ul-pagenews li',
  listItemParser: ($item, $, pageUrl) => {
    const $a = $item.find('a.con').first();
    const href = $a.attr('href');
    let itemUrl = '';
    if (href) {
      itemUrl = href.startsWith('http') ? href : new URL(href, pageUrl).href;
    }
    const rawDate = $a.find('.day').text().trim();
    return {
      title: $a.find('.tit').text().trim(),
      link: itemUrl,
      date: rawDate.replace(/\./g, '-'),
    };
  },
  fetchDetail: true,
  detailContentSelector: '.TRS_Editor',
});
