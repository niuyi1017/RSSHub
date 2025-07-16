/* eslint-disable curly */
/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
/**
 * 通用网页抓取器 - CommonJS版本
 * 基于Puppeteer的通用HTML内容抓取工具
 * 使用单例模式管理浏览器实例，提高性能
 */

const puppeteer = require('puppeteer');

class WebScraper {
    constructor(options = {}) {
        this.maxRetries = options.maxRetries || 3;
        this.debug = options.debug || false;
        this.timeout = options.timeout || 30000;
        this.maxPages = options.maxPages || 5; // 最大页面数

        // 单例浏览器实例
        this.browser = null;
        this.pagePool = []; // 页面池
        this.isClosing = false;
    }

    /**
     * 获取单例浏览器实例
     */
    async getBrowser() {
        if (!this.browser || this.browser.isConnected() === false) {
            // if (this.debug) console.log('🚀 启动浏览器实例...');

            this.browser = await puppeteer.launch({
                headless: true,
                defaultViewport: null,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-blink-features=AutomationControlled',
                    '--disable-web-security',
                    '--disable-dev-shm-usage',
                    '--disable-extensions',
                    '--disable-plugins',
                    '--disable-images', // 不加载图片以提高速度
                    // '--disable-javascript', // 注释掉，很多网站需要JS
                ],
            });

            // 预热页面池
            await this.initPagePool();
        }
        return this.browser;
    }

    /**
     * 初始化页面池
     */
    async initPagePool() {
        // if (this.debug) console.log('🔄 初始化页面池...');

        for (let i = 0; i < this.maxPages; i++) {
            const page = await this.browser.newPage();
            await this.setupPage(page);
            this.pagePool.push(page);
        }
    }

    /**
     * 设置页面配置
     */
    async setupPage(page) {
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

        // 设置请求拦截，优化性能
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            const resourceType = request.resourceType();
            // 只阻止图片和媒体文件，保留样式表和字体以确保页面正常渲染
            if (['image', 'media'].includes(resourceType)) {
                request.abort();
            } else {
                request.continue();
            }
        });
    }

    /**
     * 获取可用页面
     */
    async getPage() {
        await this.getBrowser();

        if (this.pagePool.length > 0) {
            return this.pagePool.pop();
        }

        // 如果池中没有页面，创建新页面
        const page = await this.browser.newPage();
        await this.setupPage(page);
        return page;
    }

    /**
     * 释放页面回池中
     */
    async releasePage(page) {
        if (this.isClosing) {
            await page.close();
            return;
        }

        try {
            // 清理页面状态
            await page.evaluate(() => {
                // 清理全局变量和事件监听器
                window.stop();
                return Promise.resolve();
            });

            // 如果池未满，放回池中
            if (this.pagePool.length < this.maxPages) {
                this.pagePool.push(page);
            } else {
                await page.close();
            }
        } catch (error) {
            // if (this.debug) console.error('页面释放失败:', error.message);
            await page.close();
        }
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

        // if (this.debug) console.log(`🚀 开始抓取: ${url}`);

        let page = null;
        let attempts = 0;
        let lastError = null;

        try {
            while (attempts < this.maxRetries) {
                attempts++;
                // if (this.debug) console.log(`🔄 第 ${attempts}/${this.maxRetries} 次尝试`);

                // 从页面池获取页面
                page = await this.getPage();

                try {
                    // 智能延迟
                    if (attempts > 1) {
                        await this.smartDelay();
                    }

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
                    // if (this.debug) console.error(`❌ 第${attempts}次尝试失败:`, error.message);
                } finally {
                    // 释放页面回池中
                    if (page) {
                        await this.releasePage(page);
                        page = null;
                    }
                }
            }

            // 所有尝试都失败了
            throw new Error(`所有 ${this.maxRetries} 次尝试均失败。最后错误: ${lastError?.message || '未知错误'}`);
        } catch (error) {
            // 确保页面被正确释放
            if (page) {
                await this.releasePage(page);
            }
            throw error;
        }
    }

    /**
     * 关闭浏览器实例和所有页面
     */
    async close() {
        if (this.isClosing) return;

        this.isClosing = true;

        // if (this.debug) console.log('🔄 关闭浏览器实例...');

        // 关闭页面池中的所有页面
        while (this.pagePool.length > 0) {
            const page = this.pagePool.pop();
            try {
                await page.close();
            } catch (error) {
                // if (this.debug) console.error('关闭页面失败:', error.message);
            }
        }

        // 关闭浏览器
        if (this.browser) {
            try {
                await this.browser.close();
            } catch (error) {
                // if (this.debug) console.error('关闭浏览器失败:', error.message);
            }
            this.browser = null;
        }

        this.isClosing = false;
    }

    /**
     * 获取浏览器状态
     */
    getStatus() {
        return {
            browserConnected: this.browser?.isConnected() || false,
            availablePages: this.pagePool.length,
            isClosing: this.isClosing,
        };
    }
}

// 单例管理器
class WebScraperManager {
    constructor() {
        this.instance = null;
    }

    getInstance(options = {}) {
        if (!this.instance) {
            this.instance = new WebScraper(options);
        }
        return this.instance;
    }

    async closeInstance() {
        if (this.instance) {
            await this.instance.close();
            this.instance = null;
        }
    }
}

// 全局单例管理器
const scraperManager = new WebScraperManager();

// 导出单例获取方法和类
module.exports = {
    WebScraper,
    getInstance: (options) => scraperManager.getInstance(options),
    closeInstance: () => scraperManager.closeInstance(),
};

// 保持向后兼容性
module.exports.default = WebScraper;
