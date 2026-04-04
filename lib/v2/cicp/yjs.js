const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
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

