const { createRoute } = require('@/v2/utils/news-list-template');

const legacyRoute = createRoute({
  host: 'https://yjs.cicp.edu.cn',
  typeName: '招生信息',
  feedTitle: (typeName) => `中央司法警官学院研究生教育部 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.jhtml`,
  typeNameSelector: '.left_top h2 a',
  listSelector: '.c1-body .c1-bline',
  listItemParser: ($item, $, pageUrl) => {
    const anchors = $item.find('.f-left a');
    const detailAnchor = anchors.last();

    const link = detailAnchor.attr('href');
    const title = (detailAnchor.attr('title') || detailAnchor.text()).trim();
    const date = $item.find('div.gray.f-right').first().text().trim();

    return {
      title,
      link: link && link.startsWith('http') ? link : link ? new URL(link, pageUrl).href : '',
      date,
    };
  },
  fetchDetail: true,
  detailContentSelector: '.rb_mid .content',
});

const admissionsRoute = createRoute({
  host: 'https://www.cicp.edu.cn',
  typeName: '招生信息',
  feedTitle: (typeName) => `中央司法警官学院研究生教育部 - ${typeName}`,
  buildPageUrl: (host) => `${host}/yjsjyb/zsxx/list-1-10`,
  listSelector: '.list-main > ul > li',
  listItemParser: ($item, $, pageUrl) => {
    // The official list stores the detail link's content ID in its click handler.
    const id = $item.attr('onclick')?.match(/^goContentPage2022\("([\da-f-]+)"/i)?.[1];
    const title = $item.find('.title h2').text().trim();
    return {
      title,
      link: id ? new URL(`content-${id}`, pageUrl).href : '',
      date: $item.find('.title b').text().trim(),
    };
  },
  fetchDetail: true,
  detailContentSelector: '.content-main',
  detailExtraSelectors: ['.fileList-box'],
  gotOptions: { https: { rejectUnauthorized: true } },
});

module.exports = (ctx) => (ctx.request.params.type === 'zsxx' ? admissionsRoute(ctx) : legacyRoute(ctx));

