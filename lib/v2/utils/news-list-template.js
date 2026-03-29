/**
 * 通用新闻列表页抓取模板
 *
 * 适用于「列表页 + 可选详情页」模式的网站（高校、政府、企业官网等）。
 * 支持两种抓取方式：got（直接 HTTP 请求）和 puppy（无头浏览器）。
 * 新增网站只需传入一个配置对象，无需重复编写抓取/解析逻辑。
 *
 * ======================== 配置字段说明 ========================
 *
 * @param {Object} config - 路由配置对象
 *
 * --- 基础信息 ---
 * @param {string}   config.host                    - 网站根地址，如 'https://yzb.btbu.edu.cn'
 * @param {Function} config.feedTitle               - Feed 标题生成函数，签名: (typeName) => string
 * @param {Function} [config.feedDescription]       - Feed 描述生成函数，默认同 feedTitle
 *
 * --- 页面 URL 构造 ---
 * @param {Function} [config.buildPageUrl]          - 页面 URL 构造函数，签名: (host, type) => string
 *                                                    默认: (host, type) => `${host}/${type}/index.htm`
 * @param {Function} [config.typePreprocess]        - 路由参数 type 预处理函数，默认: (type) => type.replace(/-/g, '/')
 *
 * --- 抓取方式 ---
 * @param {string}   [config.fetchMethod='got']     - 列表页抓取方式: 'got' | 'puppy'
 *
 * --- 列表页解析 ---
 * @param {string}   [config.typeNameSelector]      - 栏目名 CSS 选择器，解析列表页获取栏目名
 * @param {string}   [config.typeName='']           - 默认栏目名（选择器取不到时的 fallback）
 * @param {string}   config.listSelector            - 列表项 CSS 选择器，如 'ul li', '.list-item', 'table tr'
 * @param {Object}   [config.listParser]            - 列表项内部元素选择器
 * @param {string}   [config.listParser.dateSelector='span']   - 日期元素选择器
 * @param {string}   [config.listParser.linkSelector='a']      - 链接元素选择器
 * @param {string}   [config.listParser.titleAttr='title']     - 标题优先读取的属性名，取不到时 fallback 为 text()
 * @param {Function} [config.listItemParser]        - 高级：完全自定义的列表项解析函数
 *                                                    签名: ($item, $, pageUrl) => { title, link, date }
 *                                                    提供此函数时将忽略 listParser 配置
 *
 * --- 详情页解析（可选）---
 * @param {boolean}  [config.fetchDetail=false]         - 是否抓取详情页全文
 * @param {string}   [config.detailFetchMethod='got']   - 详情页抓取方式: 'got' | 'puppy'
 * @param {string}   [config.detailContentSelector]     - 详情页正文 CSS 选择器，如 '#vsb_content'
 * @param {string[]} [config.detailExtraSelectors=[]]   - 附加内容选择器数组（如附件列表）
 * @param {Function} [config.detailParser]              - 高级：完全自定义的详情页解析函数
 *                                                        签名: ($, itemUrl) => descriptionHtml
 *                                                        提供此函数时将忽略 detailContentSelector / detailExtraSelectors
 *
 * --- 编码处理 ---
 * @param {string}   [config.encoding]              - 页面编码，如 'gb2312'、'gbk'。设置后自动用 iconv-lite 转码
 *                                                    默认不设置（UTF-8 页面无需配置）
 *
 * --- 时间处理 ---
 * @param {number}   [config.timezone=8]            - 时区偏移（默认 UTC+8 中国）
 *
 * ======================== 使用示例 ========================
 *
 * 示例 1: got 模式 + 抓取详情页全文（如 001/yjsy.js）
 * --------------------------------------------------------
 *
 *   const { createRoute } = require('@/v2/utils/news-list-template');
 *
 *   module.exports = createRoute({
 *       host: 'https://yzb.btbu.edu.cn',
 *       typeName: '研究生院',
 *       feedTitle: (typeName) => `北京工商大学研究生院 - ${typeName}`,
 *       typeNameSelector: '.add h2',
 *       listSelector: '.page .title .list ul li',
 *       fetchDetail: true,
 *       detailContentSelector: '#vsb_content',
 *       detailExtraSelectors: ['ul[style="list-style-type:none;"]'],
 *   });
 *
 * 示例 2: puppy（无头浏览器）模式，不抓详情页（如 ahau/yjs.js）
 * --------------------------------------------------------
 *
 *   const { createRoute } = require('@/v2/utils/news-list-template');
 *
 *   module.exports = createRoute({
 *       host: 'http://yjs.ahau.edu.cn',
 *       typeName: '研究生招生信息网',
 *       feedTitle: (typeName) => `安徽农业大学研究生院 - ${typeName}`,
 *       fetchMethod: 'puppy',
 *       buildPageUrl: (host, type) => `${host}/${type}.htm`,
 *       typeNameSelector: '.ny-newslist_l h1',
 *       listSelector: '.newslist_r ul li',
 *   });
 *
 * 对应的 router.js 不需要改动，保持原样即可：
 *
 *   module.exports = function (router) {
 *       router.get('/yjsy/:type', require('./yjsy'));
 *   };
 */

const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

/**
 * 根据 fetchMethod 获取页面 HTML
 * @param {string} url - 页面 URL
 * @param {string} method - 'got' | 'puppy'
 * @param {string} [encoding] - 页面编码（如 'gb2312'），不设置则默认 UTF-8
 */
async function fetchHTML(url, method, encoding) {
  if (method === 'puppy') {
    const { getInstance } = require('@/utils/puppy');
    const scraper = getInstance();
    const { html } = await scraper.scrapeUrl(url);
    return html;
  }
  if (encoding) {
    const iconv = require('iconv-lite');
    const response = await got(url, { responseType: 'buffer', https: { rejectUnauthorized: false } });
    return iconv.decode(response.data, encoding);
  }
  // 默认 got（忽略 SSL 证书错误，部分高校站点证书过期或自签名）
  const response = await got(url, { https: { rejectUnauthorized: false } });
  return response.data;
}

/**
 * 默认的列表项解析逻辑
 */
function defaultListItemParser($item, $, pageUrl, listParser) {
  const { dateSelector = 'span', linkSelector = 'a', titleAttr = 'title', dateTransform } = listParser || {};

  let itemDate = $item.find(dateSelector).text();
  if (dateTransform) {
    itemDate = dateTransform(itemDate);
  }
  const aTag = $item.find(linkSelector);
  const itemTitle = (titleAttr && aTag.attr(titleAttr)) || aTag.text();
  const itemPath = aTag.attr('href');

  let itemUrl = '';
  if (itemPath && itemPath.startsWith('http')) {
    itemUrl = itemPath;
  } else if (itemPath) {
    itemUrl = new URL(itemPath, pageUrl).href;
  }

  return {
    title: itemTitle,
    link: itemUrl,
    date: itemDate,
  };
}

/**
 * 抓取详情页内容
 */
async function fetchDetailContent(itemUrl, config) {
  const { detailFetchMethod = 'got', detailContentSelector, detailExtraSelectors = [], detailParser, encoding } = config;

  const html = await fetchHTML(itemUrl, detailFetchMethod, encoding);
  const $ = cheerio.load(html);

  if (detailParser) {
    return detailParser($, itemUrl);
  }

  let description = '';
  if (detailContentSelector) {
    const content = $(detailContentSelector);
    if (content.length > 0) {
      description = content.html().trim();
    }
  }

  for (const selector of detailExtraSelectors) {
    const extra = $(selector);
    if (extra.length > 0) {
      description += extra.html().trim();
    }
  }

  return description || null;
}

/**
 * 创建路由处理函数
 * @param {Object} config - 配置对象，详见文件顶部 JSDoc
 * @returns {Function} Koa 路由处理函数 async (ctx) => {}
 */
function createRoute(config) {
  const {
    host,
    typeName: defaultTypeName = '',
    feedTitle,
    feedDescription,
    buildPageUrl = (h, t) => `${h}/${t}/index.htm`,
    typePreprocess = (type) => type.replace(/-/g, '/'),
    fetchMethod = 'got',
    typeNameSelector,
    listSelector,
    listParser,
    listItemParser,
    fetchDetail = false,
    encoding,
    timezone: tz = 8,
  } = config;

  return async (ctx) => {
    let { type } = ctx.params;
    type = typePreprocess(type);
    const pageUrl = buildPageUrl(host, type);

    // 1. 获取列表页 HTML
    const html = await fetchHTML(pageUrl, fetchMethod, encoding);
    const $ = cheerio.load(html);

    // 2. 提取栏目名
    const resolvedTypeName = (typeNameSelector && $(typeNameSelector).text()) || defaultTypeName;

    // 3. 解析列表项
    const list = $(listSelector);
    const parsedItems = Array.from(list).map((item) => {
      const $item = $(item);
      if (listItemParser) {
        return listItemParser($item, $, pageUrl);
      }
      return defaultListItemParser($item, $, pageUrl, listParser);
    });

    // 4. 构建 RSS items（可选抓取详情页）
    let items;
    if (fetchDetail) {
      items = await Promise.all(
        parsedItems.map((parsed) =>
          ctx.cache.tryGet(parsed.link, async () => {
            let description = parsed.title;
            try {
              const detail = await fetchDetailContent(parsed.link, config);
              if (detail) {
                description = detail;
              }
            } catch (e) {
              // 详情页抓取失败，使用标题作为 description
              description = parsed.title;
            }
            return {
              title: parsed.title,
              link: parsed.link,
              pubDate: timezone(parseDate(parsed.date), tz),
              description,
            };
          })
        )
      );
    } else {
      items = parsedItems.map((parsed) => ({
        title: parsed.title,
        link: parsed.link,
        pubDate: timezone(parseDate(parsed.date), tz),
        description: parsed.title,
      }));
    }

    // 5. 输出 RSS Feed
    const titleGen = feedTitle || (() => resolvedTypeName);
    const descGen = feedDescription || titleGen;

    ctx.state.data = {
      title: titleGen(resolvedTypeName),
      link: pageUrl,
      description: descGen(resolvedTypeName),
      item: items,
    };
  };
}

module.exports = { createRoute };
