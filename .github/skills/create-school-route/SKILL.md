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

### Step 2: Fetch Page HTML

使用 [fetch-page.js](../../../scripts/fetch-page.js) 获取 HTML（封装了 `got` 和 `puppy`，与路由运行时一致）。

```bash
# 列表页
node scripts/fetch-page.js "TARGET_URL"

# 列表页（JS 渲染）— 如果上面拿到的 HTML 列表区域为空
node scripts/fetch-page.js "TARGET_URL" --puppy

# 详情页
node scripts/fetch-page.js "DETAIL_URL" --out _temp_detail.html
```

默认保存到 `_temp_page.html`。读取 HTML 后自行分析 DOM 结构，确定列表选择器、日期选择器、栏目名选择器、详情页正文选择器等。如必须用 puppy 才能获取内容，路由需加 `fetchMethod: 'puppy'`。

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
   nvs use 18
   node -e "require('./lib/app');const r=require('./lib/v2/<folder>/<route>');console.log(typeof r)"
   ```
   应输出 `function`。
3. 清理临时文件:
   ```powershell
   Remove-Item _temp_page.html, _temp_detail.html
   ```
4. 建议用户测试完整路由: `http://localhost:1200/<folder>/<route>/<type>`

### Step 5: Git Commit

校验通过后，提交所有变更文件。

#### Commit 消息格式

```
feat(route): /<folder>/<route>/:type
```

**示例:**
- `feat(route): /sdu/cmse/:type` — 新增路由
- `fix(route): /sdu/cmse/:type` — 修复已有路由

#### 提交步骤

1. `git add` 所有相关文件（handler、router、maintainer、docs/yanbot.md）
2. `git commit` 使用上述格式的消息

#### 注意
- 仅提交本次路由相关的文件，不要混入无关改动
- 如果修改了已有的 `router.js` / `maintainer.js`，确认未破坏其他路由

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
| Encoding issues | Most Chinese sites use UTF-8; if GBK, may need custom handling |
| 403/blocked | Try `fetchMethod: 'puppy'` with browser User-Agent |
| Module load test fails | 确保用 `require('./lib/app')` 先注册 `@/` 别名，且使用 Node 18 |
