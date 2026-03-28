/* eslint-disable no-console */
/**
 * 验证 v2 路由模块是否能正常加载
 *
 * 用法: node scripts/verify-route.js <folder>/<route>
 * 示例: node scripts/verify-route.js cupl/yjsy
 *       node scripts/verify-route.js sdu/cmse
 */

const path = process.argv[2];
if (!path) {
  console.error('用法: node scripts/verify-route.js <folder>/<route>');
  console.error('示例: node scripts/verify-route.js cupl/yjsy');
  process.exit(1);
}

const projectRoot = require('path').resolve(__dirname, '..');
const modulePath = `./lib/v2/${path}`;

try {
  process.chdir(projectRoot);
  require(projectRoot + '/lib/app'); // 初始化别名
  const mod = require(projectRoot + '/lib/v2/' + path);
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
