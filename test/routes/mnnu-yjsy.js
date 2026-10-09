const got = require('@/utils/got');
const cheerio = require('cheerio');
const route = require('@/v2/mnnu/yjsy');

jest.mock('@/utils/got', () => jest.fn());

it('仅采集硕士招生列表，使用当前栏目名称并保留日期、两种正文模板和不重复的附件', async () => {
    const host = 'https://yjsy.mnnu.edu.cn';
    const pageUrl = `${host}/zsgz/ssyjszs.htm`;
    const articleUrls = [`${host}/info/1072/5835.htm`, `${host}/info/1072/5805.htm`];
    const fullTitle = '闽南师范大学2027年硕士研究生招生简章';
    const attachment = '/system/_content/download.jsp?urltype=news.DownloadAttachUrl&owner=1661461129&wbfileid=2FE6D701A5A1461D3F7E8D6DFEF965CE';
    const pages = {
        [pageUrl]: `
            <div class="main_titT"><a class="cur">招生工作</a></div>
            <div class="main_conLT"><dl><dd><a href="ssyjszs.htm" class="cur">硕士研究生招生</a></dd></dl></div>
            <aside class="main_conRCb"><ul><li><span>2026-10-09</span><a href="side.htm">侧栏公告</a></li></ul></aside>
            <div class="main_conR"><div class="main_conRCb"><ul>
                <li><span>2026-09-30</span><a href="../info/1072/5835.htm"><em>${fullTitle}</em></a></li>
                <li><span>2026-09-14</span><a href="${articleUrls[1]}" title="推荐免试攻读研究生工作办法"><em>推荐免试攻读研究生...</em></a></li>
            </ul></div><div class="pagination"><ul><li><a href="ssyjszs/8.htm">下页</a></li></ul></div></div>`,
        [articleUrls[0]]: `
            <header>网站导航</header><div class="main_content"><div class="main_contit"><h2>${fullTitle}</h2><p>作者： 时间：2026-09-30 点击数：123</p></div>
            <div class="main_conDiv" id="vsb_content"><div class="v_news_content"><p>硕士研究生招生简章正文。</p></div>
            <ul style="list-style-type:none;"><li>附件【<a href="${attachment}">2027考试大纲.zip</a>】</li></ul>
            </div>
            <div class="prenext">上一篇、下一篇导航</div></div>`,
        [articleUrls[1]]: '<div class="main_content"><div class="main_conDiv" id="vsb_content_4"><div class="v_news_content"><p>推荐免试攻读研究生工作办法正文。</p></div></div><div class="main_art">上一篇、下一篇导航</div></div>',
    };
    got.mockImplementation((url) => {
        if (!Object.prototype.hasOwnProperty.call(pages, url)) {
            throw new Error(`未预期的抓取地址：${url}`);
        }
        return Promise.resolve({ data: pages[url] });
    });
    const ctx = { params: { type: 'zsgz-ssyjszs' }, state: {}, cache: { tryGet: (_, load) => load() } };

    await route(ctx);

    expect(ctx.state.data.title).toBe('闽南师范大学研究生院 - 硕士研究生招生');
    expect(ctx.state.data.link).toBe(pageUrl);
    expect(ctx.state.data.item).toHaveLength(2);
    const [article, second] = ctx.state.data.item;
    expect(article.title).toBe(fullTitle);
    expect(article.link).toBe(articleUrls[0]);
    expect(article.pubDate.toISOString()).toBe('2026-09-29T16:00:00.000Z');
    expect(article.description).toContain('硕士研究生招生简章正文。');
    expect(article.description).not.toMatch(/网站导航|作者|点击数|上一篇|下一篇/);
    const $ = cheerio.load(article.description);
    expect($('a')).toHaveLength(1);
    expect($('a').attr('href')).toBe(attachment);
    expect($('a').text()).toBe('2027考试大纲.zip');
    expect(second.title).toBe('推荐免试攻读研究生工作办法');
    expect(second.link).toBe(articleUrls[1]);
    expect(second.pubDate.toISOString()).toBe('2026-09-13T16:00:00.000Z');
    expect(second.description).toContain('推荐免试攻读研究生工作办法正文。');
    expect(second.description).not.toMatch(/上一篇|下一篇/);
    expect(got.mock.calls.map(([url]) => url)).toEqual([pageUrl, ...articleUrls]);
});
