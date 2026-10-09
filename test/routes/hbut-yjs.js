const got = require('@/utils/got');
const cheerio = require('cheerio');
const route = require('@/v2/hbut/yjs');

jest.mock('@/utils/got', () => jest.fn());

it('采集硕士招生列表的完整标题、置顶日期及正文外附件，并保留同名不同链接的公告', async () => {
    const host = 'https://yjs.hbut.edu.cn';
    const pageUrl = `${host}/zsgz/sszs.htm`;
    const pinnedUrl = `${host}/info/1010/8337.htm`;
    const articleUrls = [`${host}/info/1085/19513.htm`, `${host}/info/1010/19503.htm`];
    const fullTitle = '湖北工业大学2027年硕士研究生招生简章';
    const attachment = '/system/_content/download.jsp?urltype=news.DownloadAttachUrl&owner=1506355238&wbfileid=E75F3B3326AC0BF1A51F06C8095248A6';
    const pages = {
        [pageUrl]: `
            <aside class="btlist"><ul><li><p><a href="side.htm">侧栏文章</a></p><span class="time">2026-10-09</span></li></ul></aside>
            <div class="m_right"><div class="dqlm"><h6>\n硕士招生</h6></div><div class="btlist"><ul>
                <li><p><a href="../info/1010/8337.htm">各学院研究生招生工作信息发布网址</a></p><span class="time">2024-10-10</span></li>
                <li><p><a href="../info/1085/19513.htm" title="${fullTitle}">湖北工业大学2027年硕士研究生...</a></p><span class="time">2026-09-29</span></li>
                <li><p><a href="${articleUrls[1]}">${fullTitle}</a></p><span class="time">2026-09-29</span></li>
            </ul><div class="fy"><ul><li><a href="sszs/1.htm">下一页</a></li></ul></div></div></div>`,
        [pinnedUrl]:
            '<div class="wznr"><div id="vsb_content_6"><div class="v_news_content"><table><tr><td>机械工程学院</td><td><a href="https://tsme.hbut.edu.cn/rcpy/yjs/tzgg.htm">学院研究生招生工作信息发布网址</a></td></tr></table></div></div></div>',
        [articleUrls[0]]: `
            <header>网站导航</header><div class="wznr"><div id="vsb_content"><div class="v_news_content"><p>招生简章正文，请下载附件查阅。</p></div></div>
            <ul style="list-style-type:none;"><li>附件【<a href="${attachment}">湖北工业大学2027年硕士研究生简章（含专业目录）.pdf</a>】</li></ul></div>
            <nav>上一篇、下一篇导航</nav>`,
        [articleUrls[1]]: '<div class="wznr"><div id="vsb_content"><div class="v_news_content"><p>同名公告的另一份正文</p></div></div></div>',
    };
    got.mockImplementation((url) => {
        if (!Object.prototype.hasOwnProperty.call(pages, url)) {
            throw new Error(`未预期的抓取地址：${url}`);
        }
        return Promise.resolve({ data: pages[url] });
    });
    const ctx = { params: { type: 'zsgz-sszs' }, state: {}, cache: { tryGet: (_, load) => load() } };

    await route(ctx);

    expect(ctx.state.data.title).toBe('湖北工业大学研究生院 - 硕士招生');
    expect(ctx.state.data.link).toBe(pageUrl);
    expect(ctx.state.data.item).toHaveLength(3);
    const [pinned, article, sameTitleArticle] = ctx.state.data.item;
    expect(pinned.link).toBe(pinnedUrl);
    expect(pinned.pubDate.toISOString()).toBe('2024-10-09T16:00:00.000Z');
    const pinnedContent = cheerio.load(pinned.description);
    expect(pinnedContent('table')).toHaveLength(1);
    expect(pinnedContent('td').first().text()).toBe('机械工程学院');
    expect(pinnedContent('a').attr('href')).toBe('https://tsme.hbut.edu.cn/rcpy/yjs/tzgg.htm');
    expect(article.title).toBe(fullTitle);
    expect(article.link).toBe(articleUrls[0]);
    expect(article.pubDate.toISOString()).toBe('2026-09-28T16:00:00.000Z');
    expect(article.description).toContain('招生简章正文，请下载附件查阅。');
    expect(article.description).not.toMatch(/网站导航|上一篇|下一篇/);
    const $ = cheerio.load(article.description);
    expect($('a')).toHaveLength(1);
    expect($('a').attr('href')).toBe(attachment);
    expect($('a').text()).toBe('湖北工业大学2027年硕士研究生简章（含专业目录）.pdf');
    expect(sameTitleArticle.title).toBe(fullTitle);
    expect(sameTitleArticle.link).toBe(articleUrls[1]);
    expect(sameTitleArticle.description).toContain('同名公告的另一份正文');
    expect(got.mock.calls.map(([url]) => url)).toEqual([pageUrl, pinnedUrl, ...articleUrls]);
});
