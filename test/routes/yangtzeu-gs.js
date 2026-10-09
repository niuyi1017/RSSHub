const got = require('@/utils/got');
const cheerio = require('cheerio');
const route = require('@/v2/yangtzeu/gs');

jest.mock('@/utils/got', () => jest.fn());

beforeEach(() => got.mockReset());

it.each([
    ['zsgz-zsjzjzyml', '招生简章及专业目录'],
    ['zsgz-sszs', '硕士招生'],
])('采集 %s 的完整标题、日期、正文 PDF 和附件', async (type, typeName) => {
    const host = 'https://gs.yangtzeu.edu.cn';
    const pageUrl = `${host}/${type.replace(/-/g, '/')}.htm`;
    const articleUrl = `${host}/info/1008/6476.htm`;
    const secondUrl = `${host}/info/1008/6427.htm`;
    const fullTitle = '【长江大学2027年研招】长江大学2027年攻读硕士学位研究生招生简章';
    const pdfUrl = `${host}/__local/notice.pdf`;
    const attachmentUrl = '/system/_content/download.jsp?urltype=news.DownloadAttachUrl&wbfileid=16015389';
    const pages = {
        [pageUrl]: `
            <aside><ul class="list"><li><a href="/sidebar.htm">侧栏链接</a></li></ul></aside>
            <div class="inner_right"><div class="local"><h2>\n<b>${typeName}</b>\n</h2></div>
                <div class="newlist1"><ul class="list">
                    <li><a href="../info/1008/6476.htm" title="${fullTitle}"><h3>长江大学2027年...</h3><span>2026-09-29</span></a></li>
                    <li><a href="../info/1008/6427.htm" title="接收免试攻读研究生招生简章"><h3>接收免试攻读研究生招生简章</h3><span>2026-09-18</span></a></li>
                </ul><div class="pagination"><a href="sszs/5.htm">下一页</a></div></div>
            </div>`,
        [articleUrl]: `
            <header>网站页头</header><div class="article">
                <h2>文章标题</h2><p class="conttime">日期：2026-10-09 浏览量：100</p>
                <div id="vsb_content"><div class="v_news_content">
                    <p>招生简章正文</p><p><script>var images = []; showVsbpdfIframe('/__local/notice.pdf', '100%', '1000');</script></p>
                </div></div>
                <ul style="list-style-type:none;"><li>附件【<a href="${attachmentUrl}">招生专业目录.pdf</a>】</li></ul>
                <div>上一篇、下一篇</div>
            </div><ul style="list-style-type:none;"><li>无关附件</li></ul>`,
        [secondUrl]: '<div class="article"><div id="vsb_content"><p>推免招生正文</p></div></div>',
    };
    got.mockImplementation((url) => {
        if (!Object.prototype.hasOwnProperty.call(pages, url)) {
            throw new Error(`未预期的抓取地址：${url}`);
        }
        return Promise.resolve({ data: pages[url] });
    });
    const ctx = { params: { type }, state: {}, cache: { tryGet: (_, load) => load() } };

    await route(ctx);

    expect(ctx.state.data.title).toBe(`长江大学研究生院 - ${typeName}`);
    expect(ctx.state.data.link).toBe(pageUrl);
    expect(ctx.state.data.item).toHaveLength(2);
    const [item, second] = ctx.state.data.item;
    expect(item.title).toBe(fullTitle);
    expect(item.link).toBe(articleUrl);
    expect(item.pubDate.toISOString()).toBe('2026-09-28T16:00:00.000Z');
    expect(item.description).toContain('招生简章正文');
    expect(item.description).not.toMatch(/网站页头|浏览量|上一篇|下一篇|无关附件|showVsbpdfIframe/);
    const $ = cheerio.load(item.description);
    expect(
        $('a')
            .map((_, element) => $(element).attr('href'))
            .get()
    ).toEqual([pdfUrl, attachmentUrl]);
    expect($('a').first().text()).toBe('查看 PDF');
    expect(second.pubDate.toISOString()).toBe('2026-09-17T16:00:00.000Z');
    expect(second.description).toContain('推免招生正文');
    expect(got.mock.calls.map(([url]) => url)).toEqual([pageUrl, articleUrl, secondUrl]);
});
