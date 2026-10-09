const got = require('@/utils/got');
const cheerio = require('cheerio');
const route = require('@/v2/whu/gs');

jest.mock('@/utils/got', () => jest.fn());

const host = 'https://gs.whu.edu.cn';
const createContext = (type) => ({
    params: { type },
    state: {},
    cache: { tryGet: (_, load) => load() },
});

beforeEach(() => got.mockReset());

it('同时输出招生章程和院系目录，保留 PDF 链接并补充目录发布日期', async () => {
    const pages = {
        [`${host}/zsgz/sszs/a2027n.htm`]: `
            <div class="right-list">
                <div class="column"><div class="location">
                    <a>首页</a><a>招生工作</a><a>硕士招生</a><a>2027年</a>
                </div></div>
                <div class="list"><ul><li><a href="../../info/2571/108711.htm">
                    <p>武汉大学2027年硕士研究生招生章程</p><span>2026-10-08</span>
                </a></li></ul></div>
                <div class="list-mulu"><ul><li><a href="../../info/2581/109131.htm">
                    <p>102外国语言文学学院(2027年)</p><span>&gt;</span>
                </a></li></ul></div>
            </div>`,
        [`${host}/info/2571/108711.htm`]: '<div id="vsb_content"><p>招生章程正文</p></div>',
        [`${host}/info/2581/109131.htm`]: `
            <meta name="PubDate" content="2026-10-08 10:59">
            <div id="vsb_content"><p><script>
                showVsbpdfIframe("/__local/catalog.pdf", "100%", "600");
            </script></p></div>`,
    };
    got.mockImplementation((url) => Promise.resolve({ data: pages[url] }));
    const ctx = createContext('zsgz-sszs-a2027n');

    await route(ctx);

    expect(ctx.state.data.title).toBe('武汉大学研究生院 - 硕士招生2027年');
    expect(ctx.state.data.item).toHaveLength(2);
    const [charter, catalogue] = ctx.state.data.item;
    expect(charter.pubDate.toISOString()).toBe('2026-10-07T16:00:00.000Z');
    expect(catalogue.pubDate.toISOString()).toBe('2026-10-08T02:59:00.000Z');
    expect(catalogue.link).toBe(`${host}/info/2581/109131.htm`);
    const $ = cheerio.load(catalogue.description);
    expect($('a').attr('href')).toBe(`${host}/__local/catalog.pdf`);
    expect($('script')).toHaveLength(0);
});

it('保留通知公告标题、第二种正文容器、附件和认证页面回退', async () => {
    const pages = {
        [`${host}/tzgg/zs.htm`]: `
            <div class="right-list">
                <div class="column"><div class="location"><a>首页</a><a>通知公告</a><a>招生</a></div></div>
                <div class="list"><ul>
                    <li><a href="../info/1062/108021.htm"><p>录取通知书通告</p><span>2026-06-26</span></a></li>
                    <li><a href="../content.jsp?wbnewsid=108691"><p>奖学金通知</p><span>2026-09-24</span></a></li>
                </ul></div>
            </div>`,
        [`${host}/info/1062/108021.htm`]: '<div id="vsb_content_2"><p>通知全文</p><a href="/files/notice.doc">附件</a></div>',
        [`${host}/content.jsp?wbnewsid=108691`]: '<script>window.location.href="https://cas.whu.edu.cn/"</script>',
    };
    got.mockImplementation((url) => Promise.resolve({ data: pages[url] }));
    const ctx = createContext('tzgg-zs');

    await route(ctx);

    expect(ctx.state.data.title).toBe('武汉大学研究生院 - 招生');
    expect(ctx.state.data.item[0].title).toBe('录取通知书通告');
    expect(ctx.state.data.item[0].description).toContain('通知全文');
    expect(ctx.state.data.item[0].description).toContain('/files/notice.doc');
    expect(ctx.state.data.item[0].pubDate.toISOString()).toBe('2026-06-25T16:00:00.000Z');
    expect(ctx.state.data.item[1].description).toBe('奖学金通知');
    expect(ctx.state.data.item[1].pubDate.toISOString()).toBe('2026-09-23T16:00:00.000Z');
});
