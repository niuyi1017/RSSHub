const got = require('@/utils/got');
const cheerio = require('cheerio');
const route = require('@/v2/bigc/gs');

jest.mock('@/utils/got', () => jest.fn());

const host = 'https://gs.bigc.edu.cn';
const createContext = (type) => ({
    params: { type },
    state: {},
    cache: { tryGet: (_, load) => load() },
});

beforeEach(() => got.mockReset());

it('采集各年度硕士招生列表，保留同名公告和正文附件并排除导航', async () => {
    const pageUrl = `${host}/yjszs/sszs/index.htm`;
    const charterUrl = `${host}/yjszs/sszs/2027nzs/charter.htm`;
    const notice2026Url = `${host}/yjszs/sszs/2026nzs/notice.htm`;
    const notice2025Url = `${host}/yjszs/sszs/2025nzs/notice.htm`;
    const fullTitle = '北京印刷学院2027年招收攻读全日制硕士学位研究生招生简章';
    const noticeTitle = '关于发放硕士研究生录取通知书的通知';
    const pages = {
        [pageUrl]: `
            <div class="subBanner"><h3><a href="index.htm"> 硕士招生 </a></h3></div>
            <section class="subPage">
                <nav><ul><li><a href="../index.htm">研究生招生</a></li></ul></nav>
                <div class="titlesList">
                    <div class="listTitle02"><span><a href="2027nzs/index.htm">更多</a></span><h3>2027年招生</h3></div>
                    <ul class="list03"><li><span>2026-10-02</span>
                        <a href="2027nzs/charter.htm" title="${fullTitle}">招生简章...</a>
                    </li></ul>
                </div>
                <div class="titlesList">
                    <div class="listTitle02"><span><a href="2026nzs/index.htm">更多</a></span><h3>2026年招生</h3></div>
                    <ul class="list03"><li><span>2026-06-12</span><a href="2026nzs/notice.htm">${noticeTitle}</a></li></ul>
                </div>
                <div class="titlesList">
                    <div class="listTitle02"><span><a href="2025nzs/index.htm">更多</a></span><h3>2025年招生</h3></div>
                    <ul class="list03"><li><span>2025-06-16</span><a href="2025nzs/notice.htm">${noticeTitle}</a></li></ul>
                </div>
            </section>
            <aside><ul class="list03"><li><span>2026-10-01</span><a href="../../other.htm">其他栏目</a></li></ul></aside>`,
        [charterUrl]: `
            <meta name="PubDate" content="2026-10-02 15:30:00">
            <header><div class="article">网站页头</div></header>
            <div class="pageArticle">
                <div class="articleTitle"><h3>${fullTitle}</h3></div>
                <div class="article"><p>招生简章正文</p>
                    <a href="../../../docs/2026-10/catalog.pdf">招生专业目录.pdf</a>
                    <a href="../../../docs/2026-10/form.doc">申请表.doc</a>
                </div>
                <nav>上一篇、下一篇导航</nav>
            </div>`,
        [notice2026Url]: '<div class="pageArticle"><div class="article"><p>2026年录取通知书发放说明</p></div></div>',
        [notice2025Url]: '<div class="pageArticle"><div class="article"><p>2025年录取通知书发放说明</p></div></div>',
    };
    got.mockImplementation((url) => {
        if (!Object.prototype.hasOwnProperty.call(pages, url)) {
            throw new Error(`未预期的抓取地址：${url}`);
        }
        return Promise.resolve({ data: pages[url] });
    });
    const ctx = createContext('yjszs-sszs');

    await route(ctx);

    expect(ctx.state.data.title).toBe('北京印刷学院研究生院 - 硕士招生');
    expect(ctx.state.data.link).toBe(pageUrl);
    expect(ctx.state.data.item).toHaveLength(3);
    const [charter, notice2026, notice2025] = ctx.state.data.item;
    expect(charter.title).toBe(fullTitle);
    expect(charter.link).toBe(charterUrl);
    expect(charter.pubDate.toISOString()).toBe('2026-10-01T16:00:00.000Z');
    expect(charter.description).toContain('招生简章正文');
    expect(charter.description).not.toContain('网站页头');
    expect(charter.description).not.toContain('上一篇、下一篇导航');
    const $ = cheerio.load(charter.description);
    expect(
        $('a')
            .toArray()
            .map((element) => $(element).attr('href'))
    ).toEqual([`${host}/docs/2026-10/catalog.pdf`, `${host}/docs/2026-10/form.doc`]);
    expect(notice2026.title).toBe(noticeTitle);
    expect(notice2025.title).toBe(noticeTitle);
    expect(notice2026.link).toBe(notice2026Url);
    expect(notice2025.link).toBe(notice2025Url);
    expect(notice2026.pubDate.toISOString()).toBe('2026-06-11T16:00:00.000Z');
    expect(notice2025.pubDate.toISOString()).toBe('2025-06-15T16:00:00.000Z');
    expect(notice2026.description).toContain('2026年录取通知书发放说明');
    expect(notice2025.description).toContain('2025年录取通知书发放说明');
    expect(got.mock.calls.map(([url]) => url)).toEqual([pageUrl, charterUrl, notice2026Url, notice2025Url]);
});

it('保留旧研究生招生参数和旧布局，在列表日期缺失时使用详情日期', async () => {
    const pageUrl = `${host}/yjszs/index.htm`;
    const articleUrl = `${host}/yjszs/notice.htm`;
    const pages = {
        [pageUrl]: `
            <div class="ins_right"><div class="title"><div class="name">研究生招生</div></div>
                <ul class="text-list"><li><a href="notice.htm" title="研究生招生通知">研究生招生通知</a></li></ul>
            </div>`,
        [articleUrl]: `
            <header>网站页头</header><div class="ins_right"><div class="content">
                <h3>时间：2025-06-16 09:30 来源：研究生院</h3>
                <p>旧版研究生招生详情</p><a href="../docs/application.doc">申请表.doc</a>
            </div><nav>上一篇、下一篇导航</nav></div>`,
    };
    got.mockImplementation((url) => {
        if (!Object.prototype.hasOwnProperty.call(pages, url)) {
            throw new Error(`未预期的抓取地址：${url}`);
        }
        return Promise.resolve({ data: pages[url] });
    });
    const ctx = createContext('yjszs');

    await route(ctx);

    expect(ctx.state.data.title).toBe('北京印刷学院研究生院 - 研究生招生');
    expect(ctx.state.data.link).toBe(pageUrl);
    expect(ctx.state.data.item).toHaveLength(1);
    const [notice] = ctx.state.data.item;
    expect(notice.title).toBe('研究生招生通知');
    expect(notice.link).toBe(articleUrl);
    expect(notice.pubDate.toISOString()).toBe('2025-06-16T01:30:00.000Z');
    expect(notice.description).toContain('旧版研究生招生详情');
    expect(notice.description).toContain(`${host}/docs/application.doc`);
    expect(notice.description).not.toContain('网站页头');
    expect(notice.description).not.toContain('上一篇、下一篇导航');
    expect(got.mock.calls.map(([url]) => url)).toEqual([pageUrl, articleUrl]);
});
