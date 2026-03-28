---
name: create-school-route
description: "Create RSSHub v2 route for a new school or institution from a URL. Use when: 新增院校路由, 对接新学校, adding school route, creating v2 route from URL, configuring createRoute, generating router.js handler files for university websites."
argument-hint: "Provide the target listing page URL and school name, e.g., 'https://yjsy.example.edu.cn/zsxx/zsjz.htm 某某大学研究生院'"
---

# Create School Route (v2)

## When to Use
- User provides a school/institution listing page URL and wants an RSSHub route for it
- Adding a new university, graduate school, or government notice page to the project
- Any page following the "list page + optional detail page" pattern

## Inputs

| Input | Required | Default | Example |
|-------|----------|---------|---------|
| **url** | Yes | — | `http://www.cmse.sdu.edu.cn/rcpy_new25/yjsjy1/tzgg.htm` |
| **school** | Recommended | Extract from page title | `山东大学材料科学与工程学院` |
| **folder** | No | URL 二级域名 | `sdu` |
| **route** | No | 有意义的子域名 | `cmse`, `yjsy` |
| **detail** | No | Auto-detect | `true` / `false` |

## Prerequisites

- **Node 18** (`nvs use 18`)

## Procedure

### Step 1: Parse URL — 命名规范

从 URL 提取参数，确定文件名和路由路径。

#### 命名规则

| 参数 | 提取方式 | 示例 URL: `http://www.cmse.sdu.edu.cn/rcpy_new25/yjsjy1/tzgg.htm` |
|------|----------|-------|
| **host** | `protocol://hostname` | `http://www.cmse.sdu.edu.cn` |
| **folder** | `.edu.cn` / `.gov.cn` 前的二级域名 | `sdu` |
| **route** | 有意义的子域名（跳过 `www`） | `cmse`（从 `www.cmse.sdu.edu.cn`）|
| **type** | 页面路径去掉 CMS 前缀，`/` 换 `-` | `yjsjy1-tzgg`（去掉 `rcpy_new25`）|

- **Handler 文件**: `lib/v2/<folder>/<route>.js`（如 `lib/v2/sdu/cmse.js`）
- **路由路径**: `/<folder>/<route>/:type`（如 `/sdu/cmse/yjsjy1-tzgg`）

#### CMS 前缀处理

很多高校 CMS 的路径中含版本目录（如 `rcpy_new25`、`zxzx_new`），这部分不进入 type，而是固定在 `buildPageUrl` 中：

| URL 路径 | CMS 前缀 | type | buildPageUrl |
|----------|----------|------|-------------|
| `rcpy_new25/yjsjy1/tzgg.htm` | `rcpy_new25` | `yjsjy1-tzgg` | `` (host, type) => `${host}/rcpy_new25/${type}.htm` `` |
| `zsxx/zsjz.htm` | 无 | `zsxx-zsjz` | `` (host, type) => `${host}/${type}.htm` `` |
| `zsxx/zsjz/index.htm` | 无 | `zsxx-zsjz` | 默认，省略 |

#### 子域名提取规则

| hostname 格式 | route |
|---------------|-------|
| `www.cmse.sdu.edu.cn` | `cmse` |
| `yjsy.gzmu.edu.cn` | `yjsy` |
| `gs.btbu.edu.cn` | `gs` |

如 `router.js` 中已有同名 route 文件且处理不同 URL 结构，则需判断是否可合并或需创建新文件。

### Step 2: Fetch & Analyze Page HTML

使用 [fetch-page.js](../../../scripts/fetch-page.js) 获取 HTML（封装了 `got` 和 `puppy`，与路由运行时一致）。

```bash
# 列表页
node scripts/fetch-page.js "TARGET_URL"

# 列表页（JS 渲染）— 如果上面拿到的 HTML 列表区域为空
node scripts/fetch-page.js "TARGET_URL" --puppy

# 详情页
node scripts/fetch-page.js "DETAIL_URL" --out _temp_detail.html
```

默认保存到 `_temp_page.html`。

**抓取方式判断:**
- 如果 `got` 成功获取到完整 HTML → 使用默认 `got` 模式
- 如果 `got` 返回 JS challenge / 空列表（反爬）→ 改用 `--puppy`，路由加 `fetchMethod: 'puppy'`
- **SSL 证书问题**（`unable to verify the first certificate`）→ `fetch-page.js` 和 `createRoute` 中 `got` 均已配置 `{ https: { rejectUnauthorized: false } }`，无需额外处理，继续用 `got` 模式即可

#### 分析 HTML 结构

**重要：使用 `read_file` 工具直接读取保存的 HTML 文件，不要用 `node -e "fs.readFileSync(...)"` 等终端命令读取。**

1. **列表页** — 用 `read_file` 读取 `_temp_page.html`（分段读取，先读前 200 行定位结构，再按需读取列表区域）：
   - 找到列表容器选择器（如 `.text-list ul li`、`.news-list li`）
   - 确认列表项内部结构：日期选择器、链接选择器、标题来源
   - 找到侧栏导航，提取所有栏目 type
   - 找到栏目名选择器（如 `.channl-menu li.on a`）

2. **详情页** — 用 `read_file` 读取 `_temp_detail.html`：
   - 搜索 `vsb_content`、`v_news_content`、`art-body` 等常见正文容器
   - 确定 `detailContentSelector`

可同时用 `fetch_webpage` 获取页面概要作为辅助参考，但选择器分析应以 `read_file` 读取的原始 HTML 为准。

### Step 3: Create Route Files

目标目录: `lib/v2/<folder>/`

#### 3a. Handler file (`<route>.js`)

```javascript
const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: '<host>',
    typeName: '<default type name>',
    feedTitle: (typeName) => `<school name> - ${typeName}`,
    // Only include if NOT default pattern:
    // buildPageUrl: (host, type) => `${host}/${type}.htm`,
    // fetchMethod: 'puppy',
    typeNameSelector: '<selector>',
    listSelector: '<selector>',
    // Only if dateSelector is not 'span':
    // listParser: { dateSelector: '<selector>' },
    fetchDetail: true,
    detailContentSelector: '<selector>',
    // detailExtraSelectors: ['<selector>'],
});
```

**配置规则:**
- 日期文本如含非标准格式（如 `[2026-03-26]` 带方括号），使用 `listItemParser` 自定义解析去掉多余字符
- `buildPageUrl` — URL 模式为默认 `${host}/${type}/index.htm` 时省略
- `fetchMethod` — 用默认 `'got'` 时省略
- **puppy 模式默认不采集详情页** — 当 `fetchMethod: 'puppy'` 时，默认省略 `fetchDetail` 及详情相关配置（puppy 采集详情页速度慢、资源开销大）。仅当用户明确要求抓取详情全文时才加 `fetchDetail: true` + `detailFetchMethod: 'puppy'`
- `listParser` — dateSelector 为默认 `'span'` 时省略
- `detailExtraSelectors` — 无附件时省略
- `fetchDetail` 及详情选择器 — 不抓详情页时省略

#### 3b. Router file (`router.js`)

```javascript
module.exports = function (router) {
    router.get('/<route>/:type', require('./<route>'));
};
```

如 `router.js` 已存在，**追加**新路由，不覆盖。

#### 3c. Maintainer file (`maintainer.js`)

```javascript
module.exports = {
    '/<route>/:type': ['yanbot-team'],
};
```

如 `maintainer.js` 已存在，添加新条目。

#### 3d. 更新文档 (`docs/yanbot.md`)

在 [docs/yanbot.md](../../../docs/yanbot.md) 中追加路由说明。格式如下：

```markdown
## <学校名>

### <栏目描述>

<Route author="yanbot-team" example="/<folder>/<route>/<default-type>" path="/<folder>/<route>/:type" :paramsDesc="['栏目类型']" >

| 栏目名1 | 栏目名2 | ... |
| ------- | ------- | --- |
| type1   | type2   | ... |

</Route>
```

**规则:**
- 如果该学校已有章节（`## <学校名>`），在其下追加新的 `### <栏目描述>` 子节
- 如果是新学校，在文件末尾追加 `## <学校名>` 及其内容
- `example` 用默认 type 值
- 表格列出该路由支持的所有栏目 type（从列表页侧栏菜单提取）

### Step 4: Verify & Cleanup

1. 检查语法错误（使用 error checker）
2. 模块加载测试:
   ```bash
   node scripts/verify-route.js <folder>/<route>
   ```
   应输出 `✓ ... 加载成功 (type: function)`。
3. 清理临时文件（仅当文件存在时）:
   ```powershell
   Remove-Item _temp_page.html -ErrorAction SilentlyContinue
   Remove-Item _temp_detail.html -ErrorAction SilentlyContinue
   ```
4. 建议用户测试完整路由: `http://localhost:1200/<folder>/<route>/<type>`

## createRoute Parameter Quick Reference

| Parameter | Type | Default | Required |
|-----------|------|---------|----------|
| `host` | string | — | Yes |
| `feedTitle` | `(typeName) => string` | — | Yes |
| `feedDescription` | `(typeName) => string` | feedTitle | No |
| `buildPageUrl` | `(host, type) => string` | `` `${host}/${type}/index.htm` `` | No |
| `typePreprocess` | `(type) => string` | `type.replace(/-/g, '/')` | No |
| `fetchMethod` | `'got'` \| `'puppy'` | `'got'` | No |
| `typeNameSelector` | string | — | Recommended |
| `typeName` | string | `''` | As fallback |
| `listSelector` | string | — | Yes |
| `listParser.dateSelector` | string | `'span'` | No |
| `listParser.linkSelector` | string | `'a'` | No |
| `listParser.titleAttr` | string | `'title'` | No |
| `listItemParser` | function | — | Advanced |
| `fetchDetail` | boolean | `false` | No |
| `detailFetchMethod` | `'got'` \| `'puppy'` | `'got'` | No |
| `detailContentSelector` | string | — | If fetchDetail |
| `detailExtraSelectors` | string[] | `[]` | No |
| `detailParser` | function | — | Advanced |
| `encoding` | string | — | No |
| `timezone` | number | `8` | No |

## Common URL Patterns

| URL Pattern | type | buildPageUrl |
|---|---|---|
| `host/zsxx/zsjz/index.htm` | `zsxx-zsjz` | 默认，省略 |
| `host/zsxx/zsjz.htm` | `zsxx-zsjz` | `` (host, type) => `${host}/${type}.htm` `` |
| `host/rcpy_new25/yjsjy1/tzgg.htm` | `yjsjy1-tzgg` | `` (host, type) => `${host}/rcpy_new25/${type}.htm` `` |
| `host/cms/zsxx/zsjz/index.htm` | `zsxx-zsjz` | `` (host, type) => `${host}/cms/${type}/index.htm` `` |

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Empty list / no items | Check JS rendering → switch to `fetchMethod: 'puppy'` |
| Wrong links (relative path) | The template auto-resolves relative URLs — verify `host` is correct |
| Dates not parsing | Adjust `listParser.dateSelector` or use `listItemParser` for custom parsing |
| Detail page empty | Try different `detailContentSelector`, check for iframe embedding |
| Encoding issues | 页面 `charset=gb2312` 或 `gbk` 时，配置 `encoding: 'gb2312'`（列表页+详情页统一转码） |
| 403/blocked | Try `fetchMethod: 'puppy'` with browser User-Agent |
| Module load test fails | 确保用 `require('./lib/app')` 先注册 `@/` 别名，且使用 Node 18 |
