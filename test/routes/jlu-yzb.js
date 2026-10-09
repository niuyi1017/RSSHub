const got = require('@/utils/got');
const cheerio = require('cheerio');
const route = require('@/v2/jlu/yzb');

jest.mock('@/utils/got', () => jest.fn());

it('仅抓取首页通知公告，恢复完整标题和分拆日期并保留正文外附件', async () => {
    const host = 'https://yzb.jlu.edu.cn';
    const fullTitle = '吉林大学2027年硕士研究生招生章程及招生专业目录';
    const attachment = '/system/_content/download.jsp?urltype=news.DownloadAttachUrl&owner=2109433285&wbfileid=18205630';
    const pages = {
        [`${host}/index.htm`]: `
            <div class="homea"><div class="wp flex">
                <div class="left">
                    <div class="intit"><div class="cn">通知公告</div><a href="index/tzgg.htm">查看更多</a></div>
                    <ul class="list flex">
                        <li><a href="info/1047/3678.htm" title="${fullTitle}">
                            <div class="time"><span>30</span>2026.09</div><h4>吉林大学2027年硕士研究生招生章程...</h4>
                        </a></li>
                        <li><a href="info/1051/3397.htm" title="专项计划招生简章">
                            <div class="time"><span>08</span>2026.05</div><h4>专项计划招生简章</h4>
                        </a></li>
                    </ul>
                </div>
                <div class="right"><ul class="list"><li><a href="info/1033/2900.htm" title="其他栏目">
                    <h4>招生宣传</h4><time>2026.06.15</time>
                </a></li></ul></div>
            </div></div>
            <div class="homeb"><ul class="list"><li><a href="info/1003/2001.htm" title="其他栏目">
                <div class="time"><span>17</span>2025.10</div><h4>招生政策</h4>
            </a></li></ul></div>`,
        [`${host}/info/1047/3678.htm`]: `
            <div class="nyrCon nyArc">
            <div id="vsb_content" class="uarc-con"><div class="v_news_content"><p>招生章程正文</p></div></div>
            <ul style="list-style-type:none;"><li>附件【<a href="${attachment}">招生专业目录.pdf</a>】</li></ul>
            <div class="arc-sib">上一篇、下一篇导航</div></div>`,
        [`${host}/info/1051/3397.htm`]: '<div id="vsb_content" class="uarc-con"><div class="v_news_content"><p>专项计划正文</p></div></div>',
    };
    got.mockReset();
    got.mockImplementation((url) => {
        if (!Object.prototype.hasOwnProperty.call(pages, url)) {
            throw new Error(`未预期的抓取地址：${url}`);
        }
        return Promise.resolve({ data: pages[url] });
    });
    const ctx = { params: {}, state: {}, cache: { tryGet: (_, load) => load() } };

    await route(ctx);

    expect(ctx.state.data.title).toBe('吉林大学研究生招生信息网 - 通知公告');
    expect(ctx.state.data.link).toBe(`${host}/index.htm`);
    expect(ctx.state.data.item).toHaveLength(2);
    const [charter, notice] = ctx.state.data.item;
    expect(charter.title).toBe(fullTitle);
    expect(charter.link).toBe(`${host}/info/1047/3678.htm`);
    expect(charter.pubDate.toISOString()).toBe('2026-09-29T16:00:00.000Z');
    expect(notice.pubDate.toISOString()).toBe('2026-05-07T16:00:00.000Z');
    expect(charter.description).toContain('招生章程正文');
    expect(charter.description).not.toContain('上一篇、下一篇导航');
    const $ = cheerio.load(charter.description);
    expect(
        $('a')
            .toArray()
            .map((element) => $(element).attr('href'))
    ).toEqual([`${host}${attachment}`]);
    expect($('a').text()).toBe('招生专业目录.pdf');
    expect(notice.description).toContain('专项计划正文');
    expect(got.mock.calls.map(([url]) => url)).toEqual([`${host}/index.htm`, `${host}/info/1047/3678.htm`, `${host}/info/1051/3397.htm`]);
});

it('参数栏目直接采集对应硕士招生列表，保留完整标题、拆分日期和正文外附件', async () => {
    const host = 'https://yzb.jlu.edu.cn';
    const pageUrl = `${host}/sszs/zsgg.htm`;
    const articleUrl = `${host}/info/1047/3678.htm`;
    const fullTitle = '吉林大学2027年硕士研究生招生章程及招生专业目录';
    const attachment = '/system/_content/download.jsp?urltype=news.DownloadAttachUrl&owner=2109433285&wbfileid=18205630';
    const pages = {
        [pageUrl]: `
            <nav><a href="../index.htm">首页</a></nav>
            <ul class="txtList"><li><a href="../info/1047/3678.htm" title="${fullTitle}">
                <time><span>30</span>2026.09</time><h4>吉林大学2027年硕士研究生招生章程...</h4>
            </a></li></ul>
            <aside><ul class="list"><li><a href="other.htm">其他栏目</a></li></ul></aside>`,
        [articleUrl]: `
            <div class="nyArc"><div id="vsb_content"><div class="v_news_content"><p>参数栏目招生章程正文</p></div></div>
                <ul style="list-style-type:none;"><li>附件【<a href="${attachment}">招生专业目录.pdf</a>】</li></ul>
                <nav>上一篇、下一篇</nav>
            </div>`,
    };
    got.mockReset();
    got.mockImplementation((url) => {
        if (!Object.prototype.hasOwnProperty.call(pages, url)) {
            throw new Error(`未预期的抓取地址：${url}`);
        }
        return Promise.resolve({ data: pages[url] });
    });
    const ctx = { params: { type: 'sszs-zsgg' }, state: {}, cache: { tryGet: (_, load) => load() } };

    await route(ctx);

    expect(ctx.state.data.title).toBe('吉林大学研究生招生信息网 - 硕士招生');
    expect(ctx.state.data.link).toBe(pageUrl);
    expect(ctx.state.data.item).toHaveLength(1);
    const [charter] = ctx.state.data.item;
    expect(charter.title).toBe(fullTitle);
    expect(charter.link).toBe(articleUrl);
    expect(charter.pubDate.toISOString()).toBe('2026-09-29T16:00:00.000Z');
    expect(charter.description).toContain('参数栏目招生章程正文');
    expect(charter.description).not.toContain('上一篇、下一篇');
    const $ = cheerio.load(charter.description);
    expect(
        $('a')
            .toArray()
            .map((element) => $(element).attr('href'))
    ).toEqual([`${host}${attachment}`]);
    expect($('a').text()).toBe('招生专业目录.pdf');
    expect(got.mock.calls.map(([url]) => url)).toEqual([pageUrl, articleUrl]);
});
