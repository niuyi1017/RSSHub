const got = require('@/utils/got');
const cheerio = require('cheerio');
const route = require('@/v2/sdutcm/yjs');

jest.mock('@/utils/got', () => jest.fn());

const host = 'https://yjs.sdutcm.edu.cn';
const pageUrl = `${host}/zsgz/sszs/tz.htm`;
const createContext = () => ({
    params: { type: 'zsgz-sszs-tz' },
    state: {},
    cache: { tryGet: (_, load) => load() },
});

beforeEach(() => got.mockReset());

it('仅采集硕士招生通知列表，保留完整标题、日期、相对和绝对文章链接及正文附件', async () => {
    const articleUrl = `${host}/zsgz/info/1015/1926.htm`;
    const externalUrl = 'http://yjs.sdutcm.edu.cn/info/1144/5219.htm';
    const fullTitle = '山东中医药大学2027年硕士研究生招生章程';
    const attachment = '/system/_content/download.jsp?urltype=news.DownloadAttachUrl&owner=2079605702&wbfileid=4125405';
    const pages = {
        [pageUrl]: `
            <div id="place"><ul><a href="/index.htm">首页</a><a href="/zsgz/sszs.htm">硕士招生</a><a href="tz.htm"> 通知 </a></ul></div>
            <aside><ul><li><span>2026-10-09</span><a href="/side.htm">侧栏公告</a></li></ul></aside>
            <div id="list"><ul>
                <li><span>2026-10-08</span><a href="../info/1015/1926.htm" title="${fullTitle}">山东中医药大学2027年硕士研究生...</a></li>
                <li><span>2026-05-25</span><a href="${externalUrl}" title="拟录取硕士研究生调档及录取通知书邮递地址确认的通知">拟录取通知</a></li>
            </ul><div class="pagination"><ul><li><a href="tz/2.htm">下一页</a></li></ul></div></div>`,
        [articleUrl]: `
            <header>网站页头</header><h1>${fullTitle}</h1><p>点击次数：100</p>
            <div id="vsb_content"><div class="v_news_content"><p>硕士研究生招生章程正文</p></div></div>
            <ul style="list-style-type:none;"><li><a href="${attachment}">招生专业目录.pdf</a></li></ul>
            <nav>上一篇、下一篇导航</nav>`,
        [externalUrl]: '<div id="vsb_content"><div class="v_news_content"><p>调档与邮递地址确认正文</p></div></div>',
    };
    got.mockImplementation((url) => {
        if (!Object.prototype.hasOwnProperty.call(pages, url)) {
            throw new Error(`未预期的抓取地址：${url}`);
        }
        return Promise.resolve({ data: pages[url] });
    });
    const ctx = createContext();

    await route(ctx);

    expect(ctx.state.data.title).toBe('山东中医药大学研究生招生信息网 - 通知');
    expect(ctx.state.data.link).toBe(pageUrl);
    expect(ctx.state.data.item).toHaveLength(2);
    const [article, external] = ctx.state.data.item;
    expect(article.title).toBe(fullTitle);
    expect(article.link).toBe(articleUrl);
    expect(article.pubDate.toISOString()).toBe('2026-10-07T16:00:00.000Z');
    expect(article.description).toContain('硕士研究生招生章程正文');
    expect(article.description).not.toMatch(/网站页头|点击次数|上一篇|下一篇/);
    const $ = cheerio.load(article.description);
    expect($('a').attr('href')).toBe(`${host}${attachment}`);
    expect($('a').text()).toBe('招生专业目录.pdf');
    expect(external.title).toBe('拟录取硕士研究生调档及录取通知书邮递地址确认的通知');
    expect(external.link).toBe(externalUrl);
    expect(external.pubDate.toISOString()).toBe('2026-05-24T16:00:00.000Z');
    expect(external.description).toContain('调档与邮递地址确认正文');
    expect(got.mock.calls.map(([url]) => url)).toEqual([pageUrl, articleUrl, externalUrl]);
});

it('将嵌套正文中的 PDF iframe 转为绝对附件链接，并只追加一次正文外的两个附件', async () => {
    const articleUrl = `${host}/zsgz/info/1015/1926.htm`;
    const pdfPath = '/__local/5/C1/CF/7BB43C58EA8EA62B44DD71EBB7E_7CE7FF13_393E8.pdf?download=1';
    const attachments = ['/system/_content/download.jsp?urltype=news.DownloadAttachUrl&owner=2079605702&wbfileid=4125404', '/system/_content/download.jsp?urltype=news.DownloadAttachUrl&owner=2079605702&wbfileid=4125405'];
    const pages = {
        [pageUrl]: `
            <div id="place"><a href="tz.htm">通知</a></div><div id="list"><ul>
                <li><span>2026-10-08</span><a href="../info/1015/1926.htm" title="山东中医药大学2027年硕士研究生招生章程">招生章程</a></li>
            </ul></div>`,
        [articleUrl]: `
            <div id="info_content"><div class="TRS_Editor"><div id="vsb_content_4"><div class="v_news_content">
                <div id="vsb_content"><div class="v_news_content">
                    <p><iframe width="900" height="1080" src="${pdfPath}"></iframe></p>
                </div></div><div id="div_vote_id"></div>
                <ul style="list-style-type:none;">
                    <li>附件【<a href="${attachments[0]}">附件2：考试内容及参考书目.pdf</a>】</li>
                    <li>附件【<a href="${attachments[1]}">附件1：招生专业目录.pdf</a>】</li>
                </ul>
            </div></div></div></div>
            <ul><li>上一篇：<a href="../1012/1927.htm">上一篇文章</a></li><li>下一篇：<a href="../1012/1921.htm">下一篇文章</a></li></ul>`,
    };
    got.mockImplementation((url) => {
        if (!Object.prototype.hasOwnProperty.call(pages, url)) {
            throw new Error(`未预期的抓取地址：${url}`);
        }
        return Promise.resolve({ data: pages[url] });
    });
    const ctx = createContext();

    await route(ctx);

    expect(ctx.state.data.item).toHaveLength(1);
    const [item] = ctx.state.data.item;
    expect(item.link).toBe(articleUrl);
    expect(item.description).not.toMatch(/上一篇|下一篇/);
    const $ = cheerio.load(item.description);
    const links = $('a');
    expect(links).toHaveLength(3);
    expect(links.first().attr('href')).toBe(`${host}${pdfPath}`);
    expect(links.first().text()).toBe('查看 PDF');
    expect($('iframe')).toHaveLength(0);
    expect(links.map((_, link) => $(link).attr('href')).get()).toEqual([`${host}${pdfPath}`, ...attachments.map((attachment) => `${host}${attachment}`)]);
    expect($('a[href*="download.jsp"]')).toHaveLength(2);
    expect(got.mock.calls.map(([url]) => url)).toEqual([pageUrl, articleUrl]);
});
