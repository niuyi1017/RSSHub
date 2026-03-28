#!/usr/bin/env node

/**
 * 使用项目内置的 got / puppy 获取页面原始 HTML 并保存到临时文件
 *
 * 用法:
 *   node scripts/fetch-page.js <url> [--puppy] [--out <file>]
 *
 * 选项:
 *   --puppy        使用无头浏览器（puppy）获取，适用于 JS 渲染页面
 *   --out <file>   保存路径（默认: _temp_page.html）
 *
 * 示例:
 *   node scripts/fetch-page.js "https://yzb.btbu.edu.cn/zsxx/zsjz.htm"
 *   node scripts/fetch-page.js "https://example.edu.cn/page.htm" --puppy
 *   node scripts/fetch-page.js "https://example.edu.cn/page.htm" --out _temp_detail.html
 */

/* eslint-disable no-console */

const path = require('path');
const fs = require('fs');

// 注册模块别名，使 require('@/...') 生效
const moduleAlias = require('module-alias');
moduleAlias.addAlias('@', path.join(__dirname, '..', 'lib'));

function parseArgs(argv) {
  const args = argv.slice(2);
  const opts = {
    url: null,
    puppy: false,
    out: '_temp_page.html',
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--puppy':
        opts.puppy = true;
        break;
      case '--out':
        opts.out = args[++i];
        break;
      case '--help':
      case '-h':
        console.log(fs.readFileSync(__filename, 'utf8').match(/\/\*\*([\s\S]*?)\*\//)[1]);
        process.exit(0);
        break;
      default:
        if (!args[i].startsWith('--') && !opts.url) {
          opts.url = args[i];
        }
    }
  }

  if (!opts.url) {
    console.error('错误: 请提供目标 URL\n用法: node scripts/fetch-page.js <url> [选项]');
    process.exit(1);
  }

  return opts;
}

async function fetchWithGot(url) {
  const got = require('@/utils/got');
  const response = await got({ method: 'get', url, https: { rejectUnauthorized: false } });
  return typeof response.data === 'string' ? response.data : response.body;
}

async function fetchWithPuppy(url) {
  const { getInstance, closeInstance } = require('@/utils/puppy');
  const scraper = getInstance();
  try {
    const result = await scraper.scrapeUrl(url);
    return result.html;
  } finally {
    await closeInstance();
  }
}

async function main() {
  const opts = parseArgs(process.argv);

  console.log(`获取: ${opts.url}`);
  console.log(`方式: ${opts.puppy ? 'puppy (无头浏览器)' : 'got (HTTP)'}`);

  const html = opts.puppy ? await fetchWithPuppy(opts.url) : await fetchWithGot(opts.url);

  fs.writeFileSync(opts.out, html);
  console.log(`已保存: ${opts.out} (${html.length} bytes)`);
}

main().catch((err) => {
  console.error('❌ 失败:', err.message);
  process.exit(1);
});
