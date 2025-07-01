/* eslint-disable curly */
/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
/**
 * 通用网页抓取器 - CommonJS版本
 * 基于Puppeteer的通用HTML内容抓取工具
 */

const puppeteer = require('puppeteer');

class WebScraper {
    constructor(options = {}) {
        this.maxRetries = options.maxRetries || 3;
        this.debug = options.debug || false;
        this.timeout = options.timeout || 30000;
    }

    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * 智能延迟策略
     */
    async smartDelay() {
        const baseDelay = 1000;
        const randomDelay = Math.random() * 2000;
        const totalDelay = baseDelay + randomDelay;
        await this.sleep(totalDelay);
    }

    /**
     * 验证URL格式
     */
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    /**
     * 抓取指定URL的完整HTML内容
     */
    async scrapeUrl(url) {
        if (!url) {
            throw new Error('URL参数不能为空');
        }

        if (!this.isValidUrl(url)) {
            throw new Error('URL格式无效');
        }

        if (this.debug) console.log(`🚀 开始抓取: ${url}`);

        const browser = await puppeteer.launch({
            headless: true,
            defaultViewport: null,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled', '--disable-web-security', '--disable-dev-shm-usage'],
        });

        let attempts = 0;
        let lastError = null;

        try {
            while (attempts < this.maxRetries) {
                attempts++;
                if (this.debug) console.log(`🔄 第 ${attempts}/${this.maxRetries} 次尝试`);

                const page = await browser.newPage();

                try {
                    // 智能延迟
                    if (attempts > 1) {
                        await this.smartDelay();
                    }

                    // 设置随机用户代理
                    const userAgents = [
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    ];
                    await page.setUserAgent(userAgents[Math.floor(Math.random() * userAgents.length)]);

                    // 设置视口
                    await page.setViewport({ width: 1920, height: 1080 });

                    // 页面加载
                    await page.goto(url, {
                        waitUntil: 'domcontentloaded',
                        timeout: this.timeout,
                    });

                    // 等待页面稳定
                    await this.sleep(2000);

                    // 获取完整HTML内容
                    const html = await page.content();
                    const title = await page.title();

                    if (this.debug) {
                        console.log('✅ 抓取成功!');
                        console.log(`📊 标题: ${title}`);
                        console.log(`📈 HTML长度: ${html.length}`);
                    }

                    return {
                        success: true,
                        url,
                        title,
                        html,
                        contentLength: html.length,
                        extractedAt: new Date().toISOString(),
                        attempts,
                    };
                } catch (error) {
                    lastError = error;
                    if (this.debug) console.error(`❌ 第${attempts}次尝试失败:`, error.message);
                } finally {
                    await page.close();
                }
            }

            // 所有尝试都失败了
            throw new Error(`所有 ${this.maxRetries} 次尝试均失败。最后错误: ${lastError?.message || '未知错误'}`);
        } finally {
            await browser.close();
        }
    }

    /**
     * 批量抓取多个URL
     */
    async scrapeMultiple(urls, options = {}) {
        const results = [];
        const { concurrent = 1, delay = 1000 } = options;

        if (concurrent === 1) {
            // 串行处理
            for (const url of urls) {
                try {
                    const result = await this.scrapeUrl(url);
                    results.push(result);
                } catch (error) {
                    results.push({
                        success: false,
                        url,
                        error: error.message,
                        extractedAt: new Date().toISOString(),
                    });
                }

                // 请求间延迟
                if (delay > 0) {
                    await this.sleep(delay);
                }
            }
        } else {
            // 并发处理（未来扩展）
            // TODO: 实现并发抓取逻辑
        }

        return results;
    }
}

module.exports = WebScraper;
