const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yjsc.jxycu.edu.cn',
  typeName: '研究生处',
  feedTitle: (typeName) => `宜春学院研究生处 - ${typeName}`,
  // 该站 IPv6 记录不可达，强制 IPv4 避免 ETIMEDOUT
  gotOptions: { dnsLookupIpVersion: 'ipv4' },
  buildPageUrl: (host, type) => `${host}/${type}/list.htm`,
  typeNameSelector: '.col_path a:last-of-type',
  listSelector: 'ul.wp_article_list li.list_item',
  listParser: {
    dateSelector: 'span.Article_PublishDate',
    linkSelector: 'span.Article_Title a',
    titleAttr: 'title',
  },
  fetchDetail: true,
  detailContentSelector: '.wp_articlecontent',
});
