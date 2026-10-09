const got = require('@/utils/got');
const cheerio = require('cheerio');
const route = require('@/v2/swust/gs');

jest.mock('@/utils/got', () => jest.fn());

const host = 'https://gs.swust.edu.cn';
const createContext = (type) => ({
    params: { type },
    state: {},
    cache: { tryGet: (_, load) => load() },
});

beforeEach(() => got.mockReset());

it('仅采集硕士招生公告，保留完整标题、列表日期和正文附件并排除分页导航', async () => {
    const pageUrl = `${host}/zs/13185/list.htm`;
    const charterUrl = `${host}/zs/2026/0929/c13185a243970/page.htm`;
    const noticeUrl = `${host}/zs/2026/0914/c13185a242856/page.htm`;
    const fullTitle = '西南科技大学2027年硕士研究生招生章程';
    const attachment = '/_upload/article/files/2026/catalog.docx';
    const pages = {
        [pageUrl]: `
            <span class="Column_Name">硕士招生</span>
            <div frag="窗口37">
                <ul>
                    <li><span><a href="/zs/2026/0929/c13185a243970/page.htm" title="${fullTitle}">西南科技大学2027年硕士研究生...</a></span><span>2026-09-30</span></li>
                    <li><span><a href="/zs/2026/0914/c13185a242856/page.htm" title="免试攻读研究生接收工作实施办法">免试攻读研究生接收工作实施办法</a></span><span>2026-09-14</span></li>
                </ul>
                <div id="wp_paging_w37"><ul class="wp_paging">
                    <li class="pages_count"><span>每页10条，共18页</span></li>
                    <li class="page_nav"><a href="list2.htm">下一页</a></li>
                    <li class="page_jump"><a href="list18.htm">末页</a></li>
                </ul></div>
            </div>`,
        [charterUrl]: `
            <header>网站页头</header><h1>${fullTitle}</h1><div>浏览次数：1234</div>
            <div class="wp_articlecontent"><div class="Article_Content"><p>硕士研究生招生章程正文</p><a class="attachment" href="${attachment}">招生专业目录.docx</a></div></div>
            <div class="wp_articlecontent">其他内容容器</div><nav>上一篇、下一篇导航</nav>`,
        [noticeUrl]: '<div class="wp_articlecontent"><p>免试接收工作办法正文</p></div>',
    };
    got.mockImplementation((url) => {
        if (!Object.prototype.hasOwnProperty.call(pages, url)) {
            throw new Error(`未预期的抓取地址：${url}`);
        }
        return Promise.resolve({ data: pages[url] });
    });
    const ctx = createContext('13185');

    await route(ctx);

    expect(ctx.state.data.title).toBe('西南科技大学研究生院 - 硕士招生');
    expect(ctx.state.data.link).toBe(pageUrl);
    expect(ctx.state.data.item).toHaveLength(2);
    const [charter, notice] = ctx.state.data.item;
    expect(charter.title).toBe(fullTitle);
    expect(charter.link).toBe(charterUrl);
    expect(charter.pubDate.toISOString()).toBe('2026-09-29T16:00:00.000Z');
    expect(charter.description).toContain('硕士研究生招生章程正文');
    expect(charter.description).not.toMatch(/网站页头|浏览次数|其他内容容器|上一篇|下一篇/);
    const $ = cheerio.load(charter.description);
    expect($('a')).toHaveLength(1);
    expect($('a').attr('href')).toBe(new URL(attachment, charterUrl).href);
    expect($('a').text()).toBe('招生专业目录.docx');
    expect(notice.link).toBe(noticeUrl);
    expect(notice.pubDate.toISOString()).toBe('2026-09-13T16:00:00.000Z');
    expect(notice.description).toContain('免试接收工作办法正文');
    expect(got.mock.calls.map(([url]) => url)).toEqual([pageUrl, charterUrl, noticeUrl]);
});

it('将硕士招生正文中的内嵌 PDF 播放器转换为可访问的附件链接', async () => {
    const pageUrl = `${host}/zs/13185/list.htm`;
    const articleUrl = `${host}/zs/2025/0929/c13185a233981/page.htm`;
    const pdfPath = '/_upload/article/files/22/ec/catalog.pdf';
    const pages = {
        [pageUrl]: `
            <span class="Column_Name">硕士招生</span><div frag="窗口37"><ul>
                <li><span><a href="/zs/2025/0929/c13185a233981/page.htm" title="西南科技大学2026年硕士研究生招生专业目录">招生专业目录</a></span><span>2025-09-29</span></li>
            </ul></div>`,
        [articleUrl]: `
            <div class="wp_articlecontent"><div class="Article_Content">
                <div class="wp_pdf_player" pdfsrc="${pdfPath}" swsrc="/_upload/article/videos/catalog.swf" sudyplayer="wp_pdf_player" contenteditable="false"></div>
            </div></div>`,
    };
    got.mockImplementation((url) => {
        if (!Object.prototype.hasOwnProperty.call(pages, url)) {
            throw new Error(`未预期的抓取地址：${url}`);
        }
        return Promise.resolve({ data: pages[url] });
    });
    const ctx = createContext('13185');

    await route(ctx);

    expect(ctx.state.data.link).toBe(pageUrl);
    expect(ctx.state.data.item).toHaveLength(1);
    const [item] = ctx.state.data.item;
    expect(item.title).toBe('西南科技大学2026年硕士研究生招生专业目录');
    expect(item.link).toBe(articleUrl);
    expect(item.pubDate.toISOString()).toBe('2025-09-28T16:00:00.000Z');
    const $ = cheerio.load(item.description);
    expect($('a').attr('href')).toBe(`${host}${pdfPath}`);
    expect($('a').text()).toBe('查看 PDF');
    expect($('.wp_pdf_player, [pdfsrc]')).toHaveLength(0);
    expect(got.mock.calls.map(([url]) => url)).toEqual([pageUrl, articleUrl]);
});
