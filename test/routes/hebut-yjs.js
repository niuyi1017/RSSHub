const got = require('@/utils/got');
const route = require('@/v2/hebut/yjs/index');

jest.mock('@/utils/got', () => jest.fn());

const host = 'https://yjs.hebut.edu.cn';
const createContext = (type) => ({
    params: { type },
    state: {},
    cache: { tryGet: (_, load) => load() },
});

beforeEach(() => got.mockReset());

it('采集实际通知列表，保留独立标题、北京时间、院系外链和附件，详情失败回退标题', async () => {
    const pageUrl = `${host}/zsgz/zsgztzgg/index.htm`;
    const articleUrl = `${host}/zsgz/zsgztzgg/charter.htm`;
    const externalUrl = 'https://jzyyssjxy.hebut.edu.cn/rcpy/yjsjy/notice.htm';
    const unavailableUrl = 'https://see.hebut.edu.cn/tzgg4/unavailable.html';
    const pages = {
        [pageUrl]: `
            <div class="block-list78"><h2> 招生工作通知公告 </h2></div>
            <nav><ul class="block-list64"><li><a href="../ssyjszszl/index.htm">硕士研究生招生</a></li></ul></nav>
            <div class="page-list18"><ul class="block-list64">
                <li><a href="charter.htm"><span class="gpArticleDate">2026-10-02</span>
                    <p class="gpArticleTitle">河北工业大学2027年硕士研究生招生章程</p></a></li>
                <li><a href="${externalUrl}"><span class="gpArticleDate">2026-09-11</span>
                    <p class="gpArticleTitle">学院推免实施细则</p></a></li>
                <li><a href="${unavailableUrl}"><span class="gpArticleDate">2026-09-10</span>
                    <p class="gpArticleTitle">暂时无法访问的院系通知</p></a></li>
            </ul><div class="gp-page1"><a href="index1.htm">下一页</a></div></div>`,
        [articleUrl]: '<div class="gp-article"><p>招生章程正文</p><a href="docs/catalog.pdf">招生专业目录.pdf</a></div><div class="navigation">上一篇下一篇</div>',
        [externalUrl]: '<div class="tncontent"><p>院系实施细则正文</p><a href="/files/form.docx">申请表</a></div>',
    };
    got.mockImplementation((url) => {
        if (url === unavailableUrl) {
            return Promise.reject(new Error('院系服务器不可用'));
        }
        if (!Object.prototype.hasOwnProperty.call(pages, url)) {
            throw new Error(`未预期的抓取地址：${url}`);
        }
        return Promise.resolve({ data: pages[url] });
    });
    const ctx = createContext('zsgztzgg');

    await route(ctx);

    expect(ctx.state.data.title).toBe('河北工业大学研究生院 - 招生工作通知公告');
    expect(ctx.state.data.link).toBe(pageUrl);
    expect(ctx.state.data.item).toHaveLength(3);
    const [charter, external, unavailable] = ctx.state.data.item;
    expect(charter.title).toBe('河北工业大学2027年硕士研究生招生章程');
    expect(charter.link).toBe(articleUrl);
    expect(charter.pubDate.toISOString()).toBe('2026-10-01T16:00:00.000Z');
    expect(charter.description).toContain('招生章程正文');
    expect(charter.description).toContain('docs/catalog.pdf');
    expect(charter.description).not.toContain('上一篇下一篇');
    expect(external.link).toBe(externalUrl);
    expect(external.description).toContain('院系实施细则正文');
    expect(external.description).toContain('/files/form.docx');
    expect(external.pubDate.toISOString()).toBe('2026-09-10T16:00:00.000Z');
    expect(unavailable.description).toBe('暂时无法访问的院系通知');
    expect(unavailable.pubDate.toISOString()).toBe('2026-09-09T16:00:00.000Z');
    expect(got.mock.calls.map(([url]) => url)).toEqual([pageUrl, articleUrl, externalUrl, unavailableUrl]);
});

it('兼容旧硕士栏目参数，直接请求迁移后的列表并按实际目录解析相对链接', async () => {
    const pageUrl = `${host}/zsgz/ssyjszszl/tzgg3_0/index.htm`;
    const articleUrl = `${host}/zsgz/ssyjszszl/tzgg3_0/adjustment.htm`;
    const pages = {
        [pageUrl]: `
            <div class="block-list78"><h2>硕士研究生招生</h2></div>
            <div class="page-list18"><ul class="block-list64"><li><a href="adjustment.htm">
                <span class="gpArticleDate">2026-07-03</span><p class="gpArticleTitle">2027年专业调整公告</p>
            </a></li></ul></div>`,
        [articleUrl]: '<div class="wenzhang2"><p>专业调整详情</p></div>',
    };
    got.mockImplementation((url) => {
        if (!Object.prototype.hasOwnProperty.call(pages, url)) {
            throw new Error(`未预期的抓取地址：${url}`);
        }
        return Promise.resolve({ data: pages[url] });
    });
    const ctx = createContext('ssyjszszl');

    await route(ctx);

    expect(ctx.state.data.link).toBe(pageUrl);
    expect(ctx.state.data.item).toHaveLength(1);
    expect(ctx.state.data.item[0].link).toBe(articleUrl);
    expect(ctx.state.data.item[0].description).toContain('专业调整详情');
    expect(ctx.state.data.item[0].pubDate.toISOString()).toBe('2026-07-02T16:00:00.000Z');
    expect(got.mock.calls.map(([url]) => url)).toEqual([pageUrl, articleUrl]);
});
