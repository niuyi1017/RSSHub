const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://zsjy.cipuc.edu.cn',
  typeName: '招生信息',
  feedTitle: (typeName) => `中国刑事警察学院招生就业网 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.position > h3',
  listSelector: 'ul.list3 li',
  listItemParser: ($item, $, pageUrl) => {
    const aTag = $item.find('a').first();
    const href = aTag.attr('href');
    const link = href ? new URL(href, pageUrl).href : '';

    const title = $item.find('p.title').text().trim() || aTag.text().trim();

    // 格式类似：03-21 / 2026
    const dateText = $item.find('div.date').text().replace(/\s+/g, '');
    let date = dateText;
    const match = dateText.match(/(\d{2})-(\d{2})\/(\d{4})/);
    if (match) {
      date = `${match[3]}/${match[1]}/${match[2]}`;
    }

    return { title, link, date };
  },
  fetchDetail: true,
  detailContentSelector: '#vsb_content .v_news_content',
  detailExtraSelectors: ['ul[style*="list-style-type:none"]'],
});

