const { createRoute } = require('@/v2/utils/news-list-template');

/** 列表页「时间：2026年04月03日」→ parseDate 可解析的 YYYY-MM-DD */
function normalizeListDate(raw) {
  const s = String(raw || '').trim();
  const m = s.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (m) {
    return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  }
  return s.replace(/^时间[：:]\s*/, '').trim();
}

module.exports = createRoute({
  host: 'https://yjsy.hljucm.net',
  typeName: '研究生院',
  feedTitle: (typeName) => `黑龙江中医药大学研究生院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.sobtitle h3 span',
  // 仅「直接」含资讯详情的 li，避免站点错误嵌套 li 时重复匹配、日期取错
  listSelector: 'ul.list > li.item:has(> a[href*="/info/"])',
  listItemParser: ($item, $, pageUrl) => {
    const $a = $item.find('> a[href*="/info/"]').first();
    const href = $a.attr('href');
    let itemUrl = '';
    if (href) {
      itemUrl = href.startsWith('http') ? href : new URL(href, pageUrl).href;
    }
    const dateRaw = $item.find('.mark span').first().text().trim();
    const date = normalizeListDate(dateRaw.replace(/^时间[：:]\s*/, '').trim());
    const title = ($a.attr('title') || $item.find('h3').first().text() || '').trim();
    return {
      title,
      link: itemUrl,
      date,
    };
  },
  fetchDetail: true,
  detailContentSelector: '.v_news_content',
  gotOptions: { dnsLookupIpVersion: 'ipv4' },
});
