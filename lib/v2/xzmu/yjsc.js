const { createRoute } = require('@/v2/utils/news-list-template');

/**
 * 列表页 URL：/yjsc/contentlist?dept_id=&column_id=&column_type=&per=&url=
 * type 两种写法：
 * 1) 仅 column_id 数字（如 630）→ 默认 dept_id=25、column_type=1、per=30、url=list_zs（与硕士招生等栏目一致）
 * 2) dept_id-column_id-column_type-per-urlslug（如 25-630-1-15-list_zs），最后一节可含下划线（如 list_zs、list_zl）
 */
function buildContentListUrl(h, type) {
  const t = String(type);
  const full = t.match(/^(\d+)-(\d+)-(\d+)-(\d+)-(.+)$/);
  if (full) {
    const [, dept_id, column_id, column_type, per, url] = full;
    return `${h}/yjsc/contentlist?dept_id=${dept_id}&column_id=${column_id}&column_type=${column_type}&per=${per}&url=${encodeURIComponent(url)}`;
  }
  if (/^\d+$/.test(t)) {
    return `${h}/yjsc/contentlist?dept_id=25&column_id=${t}&column_type=1&per=30&url=list_zs`;
  }
  return `${h}/yjsc/contentlist?${t}`;
}

module.exports = createRoute({
  host: 'https://www1.xzmu.edu.cn',
  typeName: '研究生院',
  feedTitle: (typeName) => `西藏民族大学研究生院 - ${typeName}`,
  typePreprocess: (type) => type,
  buildPageUrl: buildContentListUrl,
  encoding: 'gbk',
  typeNameSelector: '.rightcon .n_titles h5',
  listSelector: 'ul.filelist > li',
  listItemParser: ($item, $, pageUrl) => {
    const $a = $item.find('a').first();
    const href = $a.attr('href');
    let link = '';
    if (href) {
      link = href.startsWith('http') ? href : new URL(href, pageUrl).href;
    }
    return {
      title: $a.find('p').first().text().trim(),
      link,
      date: $a.find('span').first().text().trim(),
    };
  },
  fetchDetail: true,
  detailContentSelector: '.newxq .ar_article',
  gotOptions: { dnsLookupIpVersion: 'ipv4' },
});
