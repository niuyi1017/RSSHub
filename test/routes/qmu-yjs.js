const got = require('@/utils/got');
const cheerio = require('cheerio');
const route = require('@/v2/qmu/yjs');

jest.mock('@/utils/got', () => jest.fn());

beforeEach(() => got.mockReset());

it('仅采集招生工作列表，保留完整标题、列表发布日期和正文附件', async () => {
    const host = 'https://yjs.qmu.edu.cn';
    const pageUrl = `${host}/7525/list.htm`;
    const articleUrl = `${host}/2026/0402/c7525a220285/page.htm`;
    const fullTitle = '齐齐哈尔医学院2026年硕士研究生招生简章及招生专业目录';
    const attachments = ['/upload/catalog.pdf', '../../files/notice.rar', './attachments/application.xlsx'];
    const pages = {
        [pageUrl]: `
            <span class="Column_Anchor">招生工作</span>
            <aside><ul class="wp_article_list"><li>
                <span class="Article_PublishDate">2026-10-09</span><a href="/sidebar.htm">侧栏新闻</a>
            </li></ul></aside>
            <div class="col_news_list"><ul class="wp_article_list">
                <li><span class="Article_Index">1</span><span class="Article_Title">
                    <a href="/2026/0402/c7525a220285/page.htm" title="${fullTitle}">齐齐哈尔医学院2026年硕士研究生...</a>
                </span><span class="Article_PublishDate">2025-09-29</span>
                    <ul class="pagination"><li><a href="/7525/list2.htm">下一页</a></li></ul>
                </li>
            </ul></div>`,
        [articleUrl]: `
            <header>网站页头</header><h1>${fullTitle}</h1>
            <div class="metadata">发布者：研究生处 发布时间：2026-04-02 浏览量：500</div>
            <div class="wp_articlecontent"><p>硕士研究生招生简章正文</p>
                <a href="${attachments[0]}">招生专业目录.pdf</a>
                <a href="${attachments[1]}">招生附件.rar</a>
                <a href="${attachments[2]}">报名表.xlsx</a>
            </div>
            <nav>上一篇、下一篇公告</nav>`,
    };
    got.mockImplementation((url) => {
        if (!Object.prototype.hasOwnProperty.call(pages, url)) {
            throw new Error(`未预期的抓取地址：${url}`);
        }
        return Promise.resolve({ data: pages[url] });
    });
    const ctx = { params: { type: '7525' }, state: {}, cache: { tryGet: (_, load) => load() } };

    await route(ctx);

    expect(ctx.state.data.title).toBe('齐齐哈尔医学院研究生处 - 招生工作');
    expect(ctx.state.data.link).toBe(pageUrl);
    expect(ctx.state.data.item).toHaveLength(1);
    const [item] = ctx.state.data.item;
    expect(item.title).toBe(fullTitle);
    expect(item.link).toBe(articleUrl);
    expect(item.pubDate.toISOString()).toBe('2025-09-28T16:00:00.000Z');
    expect(item.description).toContain('硕士研究生招生简章正文');
    expect(item.description).not.toMatch(/网站页头|发布者|发布时间|浏览量|上一篇|下一篇/);
    const $ = cheerio.load(item.description);
    expect(
        $('a')
            .map((_, link) => $(link).attr('href'))
            .get()
    ).toEqual(attachments);
    expect(
        $('a')
            .map((_, link) => $(link).text())
            .get()
    ).toEqual(['招生专业目录.pdf', '招生附件.rar', '报名表.xlsx']);
    expect(got.mock.calls.map(([url]) => url)).toEqual([pageUrl, articleUrl]);
});
