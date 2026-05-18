/* eslint-disable no-console */
/**
 * 验证 v2 路由模块是否能正常加载，并可选地验证 HTTP 响应是否为有效 RSS
 *
 * 用法: node scripts/verify-route.js <folder>/<route> [type]
 * 示例: node scripts/verify-route.js cupl/yjsy
 *       node scripts/verify-route.js sdu/cmse yjsjy1-tzgg
 *
 * 提供 type 参数时，将向 http://localhost:1200/<folder>/<route>/<type>
 * 发起 GET 请求，并验证响应为有效的 RSS/Atom 格式。
 */

const routePath = process.argv[2];
const typeArg = process.argv[3];

if (!routePath) {
  console.error('用法: node scripts/verify-route.js <folder>/<route> [type]');
  console.error('示例: node scripts/verify-route.js cupl/yjsy');
  console.error('      node scripts/verify-route.js sdu/cmse yjsjy1-tzgg  (含 HTTP 响应验证)');
  process.exit(1);
}

const projectRoot = require('path').resolve(__dirname, '..');
const modulePath = `./lib/v2/${routePath}`;

// Step 1: 模块加载验证
try {
  process.chdir(projectRoot);
  require(projectRoot + '/lib/app'); // 初始化别名
  const mod = require(projectRoot + '/lib/v2/' + routePath);
  const type = typeof mod;
  if (type === 'function') {
    console.log(`✓ ${modulePath} 加载成功 (type: function)`);
  } else {
    console.error(`✗ ${modulePath} 加载异常: 期望 function, 实际 ${type}`);
    process.exit(1);
  }
} catch (e) {
  console.error(`✗ ${modulePath} 加载失败:`);
  console.error(e.message);
  process.exit(1);
}

// Step 2: HTTP RSS 响应验证（仅当提供 type 参数时执行）
if (typeArg) {
  const got = require('got');
  const url = `http://localhost:1200/${routePath}/${typeArg}`;

  console.log(`\n正在请求: ${url}`);

  (async () => {
    try {
      const response = await got(url, {
        timeout: { request: 30000 },
        throwHttpErrors: true,
        https: { rejectUnauthorized: false },
      });

      const contentType = response.headers['content-type'] || '';
      const body = response.body;

      const hasRssRoot = /<rss[\s>]/i.test(body) || /<feed[\s>]/i.test(body);

      if (hasRssRoot) {
        const ct = contentType.split(';')[0].trim();
        console.log(`✓ HTTP 响应验证通过 — 有效的 RSS/Atom 格式 (Content-Type: ${ct})`);
      } else {
        console.error(`✗ HTTP 响应不是有效的 RSS/Atom 格式`);
        console.error(`  Content-Type: ${contentType}`);
        console.error(`  响应开头: ${body.slice(0, 300)}`);
        process.exit(1);
      }
    } catch (e) {
      console.error(`✗ HTTP 请求失败: ${e.message}`);
      if (e.response) {
        console.error(`  状态码: ${e.response.statusCode}`);
        console.error(`  响应开头: ${String(e.response.body).slice(0, 300)}`);
      } else {
        console.error('  请确认 RSSHub 服务已启动 (npm run dev)');
      }
      process.exit(1);
    }
  })();
}
