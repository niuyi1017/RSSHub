const { createRoute } = require('@/v2/utils/news-list-template');

const options = {
  host: 'https://marxism.jiangnan.edu.cn',
  typeName: '马克思主义学院',
  feedTitle: (typeName) => `江南大学马克思主义学院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  fetchDetail: true,
  detailContentSelector: '.v_news_content',
};

const legacyRoute = createRoute({
  ...options,
  typeNameSelector: '.coum_title H3',
  listSelector: '.list_content li',
  listParser: { dateSelector: 'span.contime', dateTransform: (d) => d.replace(/[()]/g, '') },
});

const mastersRoute = createRoute({
  ...options,
  typeName: '硕士',
  listSelector: '.listNr .n_bt > ul > li > a[href]',
  listItemParser: (article, $, pageUrl) => ({
    title: (article.attr('title') || article.find('.headline20-2').text()).trim(),
    link: new URL(article.attr('href'), pageUrl).href,
    date: `${article.find('.time .year').text().trim()}-${article.find('.time .day').text().trim()}`,
  }),
  gotOptions: { https: { rejectUnauthorized: true } },
});

// These articles were republished under new URLs when the school changed its site.
const previousGuids = new Map(
  [
    [2775, 5815],
    [2776, 5801],
    [2777, 5800],
    [2778, 5799],
    [2779, 5779],
    [2780, 5707],
    [2781, 5706],
    [2782, 5678],
    [2783, 4735],
    [2784, 4734],
    [2785, 4435],
    [2786, 4115],
    [2787, 4114],
    [2788, 3965],
  ].map(([currentId, previousId]) => [`${options.host}/info/1018/${currentId}.htm`, `${options.host}/info/1027/${previousId}.htm`])
);

module.exports = async (ctx) => {
  if (ctx.params.type !== 'zsjy-ss') {
    return legacyRoute(ctx);
  }

  await mastersRoute(ctx);
  ctx.state.data.item = ctx.state.data.item.map((item) => ({
    ...item,
    guid: previousGuids.get(item.link) || item.link,
  }));
};
