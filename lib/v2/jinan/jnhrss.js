const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://jnhrss.jinan.gov.cn',
  typeName: '济南事业单位公开招聘',
  feedTitle: (typeName) => `济南市人力资源和社会保障局 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}/index.html`,
  fetchMethod: 'puppy',
  typeNameSelector: 'title',
  listSelector: '.col_rgt ul li',
  limit: 20,
  listItemParser: ($item, $, pageUrl) => {
    const a = $item.find('a.bt-lef');
    const rawTitle = a.attr('title') || a.text().trim();
    const title = rawTitle.replace(/\s+\d{4}年\d{2}月\d{2}日$/, '').trim();
    const href = a.attr('href') || '';
    const link = href.startsWith('http') ? href : new URL(href, pageUrl).href;
    const date = $item.find('span.bt-right').text().replace(/[\[\]]/g, '').trim();
    return { title, link, date };
  },
});
