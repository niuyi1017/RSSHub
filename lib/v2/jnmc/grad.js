const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://grad.jnmc.edu.cn',
  typeName: '研究生处',
  feedTitle: (typeName) => `济宁医学院研究生处 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}/list.htm`,
  typePreprocess: (type) => type,
  typeNameSelector: '.col_title h2',
  listSelector: 'ul.wp_article_list li.list_item',
  listParser: {
    dateSelector: 'span.Article_PublishDate',
    linkSelector: 'span.Article_Title a',
    titleAttr: 'title',
  },
  fetchDetail: true,
  detailContentSelector: '.wp_articlecontent',
});
