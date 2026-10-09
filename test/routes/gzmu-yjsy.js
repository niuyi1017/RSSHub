const got = require('@/utils/got');
const cheerio = require('cheerio');
const route = require('@/v2/gzmu/yjsy');

jest.mock('@/utils/got', () => jest.fn());

beforeEach(() => got.mockReset());

it.each([
    ['zsgz-ssyjszs', '硕士研究生招生'],
    ['zsgz-bsyjszs', '博士研究生招生'],
])('采集新版%s栏目，使用纯标题并保留正文附件', async (type, typeName) => {
    const host = 'https://yjsy.gzmu.edu.cn';
    const columnPath = type.replace(/-/g, '/');
    const pageUrl = `${host}/${columnPath}`;
    const charterUrl = `${pageUrl}/content_88048`;
    const noticeUrl = `${pageUrl}/content_87575`;
    const fullTitle = `贵州民族大学2027年${typeName}章程`;
    const noticeTitle = '招生录取工作办法';
    const attachment = '/upload/yjsy/contentmanage/article/file/2026/10/08/catalog.pdf?t=1791466148668';
    const pages = {
        [pageUrl]: `
            <aside><ul class="newsList"><li><span class="date">2026-10-09</span><a href="/other">侧栏通知</a></li></ul></aside>
            <div class="mainContent"><div class="mainBox">
                <div class="mHd"><h3><span>${typeName}</span></h3></div>
                <div class="mBd"><ul class="newsList">
                    <li><span class="date">2026-10-08</span>
                        <a href="/${columnPath}/content_88048" title="标题：${fullTitle}&#xD;&#xA;点击数：6&#xD;&#xA;发表时间：2026-10-08">
                            ${fullTitle}
                        </a>
                    </li>
                    <li><a href="/${columnPath}/content_87575" title="标题：${noticeTitle}&#xD;&#xA;点击数：1431&#xD;&#xA;发表时间：2026-09-18">${noticeTitle}</a></li>
                </ul><ul class="pagination"><li><a href="${pageUrl}?page=2">下一页</a></li></ul></div>
            </div></div>`,
        [charterUrl]: `
            <meta name="PubDate" content="2026-10-08 21:25">
            <header>网站页头</header><article class="articleCon">
                <h1>${fullTitle}</h1><div class="fontSize">字体：小 大</div>
                <div class="conTxt"><p>招生章程正文</p><a class="attachment-link" href="${attachment}">招生专业目录.pdf</a></div>
                <div class="likes">点赞 收藏</div><nav>上一篇、下一篇导航</nav>
            </article>`,
        [noticeUrl]: '<meta name="PubDate" content="2026-09-18 09:30"><div class="articleCon"><div class="conTxt"><p>录取工作办法正文</p></div></div>',
    };
    got.mockImplementation((url) => {
        if (!Object.prototype.hasOwnProperty.call(pages, url)) {
            throw new Error(`未预期的抓取地址：${url}`);
        }
        return Promise.resolve({ data: pages[url] });
    });
    const ctx = { params: { type }, state: {}, cache: { tryGet: (_, load) => load() } };

    await route(ctx);

    expect(ctx.state.data.title).toBe(`贵州民族大学研究生院 - ${typeName}`);
    expect(ctx.state.data.link).toBe(pageUrl);
    expect(ctx.state.data.item).toHaveLength(2);
    const [charter, notice] = ctx.state.data.item;
    expect(charter.title.trim()).toBe(fullTitle);
    expect(charter.title).not.toMatch(/标题：|点击数：|发表时间：/);
    expect(charter.link).toBe(charterUrl);
    expect(charter.pubDate.toISOString()).toBe('2026-10-07T16:00:00.000Z');
    expect(charter.description).toContain('招生章程正文');
    expect(charter.description).not.toMatch(/网站页头|字体：|点赞|收藏|上一篇|下一篇/);
    const $ = cheerio.load(charter.description);
    expect($('a.attachment-link').attr('href')).toBe(attachment);
    expect(notice.title).toBe(noticeTitle);
    expect(notice.link).toBe(noticeUrl);
    expect(notice.pubDate.toISOString()).toBe('2026-09-18T01:30:00.000Z');
    expect(notice.description).toContain('录取工作办法正文');
    expect(got.mock.calls.map(([url]) => url)).toEqual([pageUrl, charterUrl, noticeUrl]);
});
