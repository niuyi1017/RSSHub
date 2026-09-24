const got = require('@/utils/got');
jest.mock('@/utils/got');
jest.mock('@/utils/puppy', () => ({ getInstance: jest.fn() }));

function context(type) {
    return { params: { type }, request: { params: { type } }, query: {}, state: {}, cache: { tryGet: jest.fn((key, fn) => fn()) } };
}

beforeEach(() => jest.resetAllMocks());

it('keeps an SJTU feed below the client size limit when an article embeds a large image', async () => {
    got.mockResolvedValueOnce({ data: '<div class="announcement-list"><a href="/post/3680"><span class="title">招生宣讲</span><span class="month">2026.05</span><span class="day">19</span></a></div>' });
    got.mockResolvedValueOnce({ data: `<div class="mce-content-body"><p>招生通知正文</p><img src="data:image/png;base64,${'a'.repeat(6 * 1024 * 1024)}"><a href="/files/guide.pdf">招生简章</a></div>` });
    const ctx = context('zkxx-sszs');
    await require('@/v2/sjtu/yzb')(ctx);
    expect(Buffer.byteLength(JSON.stringify(ctx.state.data))).toBeLessThan(5 * 1024 * 1024);
    expect(ctx.state.data.item[0].description).toContain('招生通知正文');
    expect(ctx.state.data.item[0].description).toContain('https://yzb.sjtu.edu.cn/files/guide.pdf');
    expect(ctx.state.data.item[0].description).toContain('https://yzb.sjtu.edu.cn/post/3680');
});

describe('admission feed safeguards', () => {
    const { createRoute } = require('@/v2/utils/news-list-template');
    const { compactDescription, getLimit, mapItems } = require('@/v2/utils/admission-feed');
    const route = createRoute({ admission: true, host: 'https://school.example', listSelector: 'li', fetchDetail: true, detailContentSelector: 'article' });

    it.each([undefined, '-1', '0', 'abc', '1.5', '1000'])('bounds the pre-fetch limit %s', (limit) => {
        expect(getLimit({ query: { limit } })).toBe(20);
    });

    it('deduplicates and rejects invalid links before fetching details', async () => {
        got.mockResolvedValue({ data: '<ul><li><a href="/a">A</a></li><li><a href="/a">A</a></li><li><a href="javascript:void(0)">B</a></li><li><a>Missing</a></li><li><a href="/b">B</a></li></ul>' });
        const ctx = context('notices');
        ctx.query.limit = '1';
        await route(ctx);
        expect(ctx.state.data.item).toHaveLength(1);
        expect(got).toHaveBeenCalledTimes(2);
        expect(ctx.cache.tryGet).toHaveBeenCalledTimes(1);
    });

    it('reports a broken list rather than a successful empty feed', async () => {
        got.mockResolvedValue({ data: '<p>JavaScript challenge</p>' });
        await expect(route(context('notices'))).rejects.toThrow('No admission items');
    });

    it('sanitizes old cached content as well as fresh results', async () => {
        got.mockResolvedValue({ data: '<li><span>2026-09-01</span><a href="/a">Updated title</a></li>' });
        const ctx = context('notices');
        ctx.cache.tryGet.mockResolvedValue({ title: 'Old title', link: 'https://school.example/a', description: '<img src="data:image/png;base64,abc"><p>正文</p>' });
        await route(ctx);
        expect(ctx.state.data.item[0].title).toBe('Updated title');
        expect(ctx.state.data.item[0].description).not.toContain('base64');
        expect(got).toHaveBeenCalledTimes(1);
    });

    it('bounds large rosters while keeping attachment links and a full-content notice', () => {
        const html = '<table><tr><td style="font-size:12px">名单</td></tr></table>'.repeat(12000) + '<a href="/list.pdf">完整名单</a>';
        const result = compactDescription(html, 'https://school.example/a');
        expect(Buffer.byteLength(result)).toBeLessThan(128 * 1024);
        expect(result).toContain('https://school.example/list.pdf');
        expect(result).toContain('官网原文');
        expect(result).not.toContain('style=');
    });

    it('preserves order with at most three simultaneous detail requests', async () => {
        let active = 0;
        let peak = 0;
        const result = await mapItems([1, 2, 3, 4, 5], async (value) => {
            active++;
            peak = Math.max(active, peak);
            await new Promise((resolve) => setTimeout(resolve, 6 - value));
            active--;
            return value;
        });
        expect(result).toEqual([1, 2, 3, 4, 5]);
        expect(peak).toBe(3);
    });

    it('does not change default template behavior for unrelated routes', async () => {
        got.mockResolvedValue({ data: '<ul></ul>' });
        const ctx = context('notices');
        await createRoute({ host: 'https://school.example', listSelector: 'li' })(ctx);
        expect(ctx.state.data.item).toEqual([]);
    });
});

it.each([
    ['zuel/yzb', '4643', '<div id="wp_news_w6"><ul class="news_list"><li class="news"><a href="/a">招生公告</a><span class="news_meta">2026-09-01</span></li></ul></div>'],
    ['gszy/yjsc', '11', '<div class="list_news_li"><a href="/show/id/1.html"><span>2026-09-01</span><h3>招生公告</h3></a></div>'],
    [
        'cmu/cmuyjs',
        'zsxx-tkss',
        '<table class="winstyle1022523"><tr><td>分页</td></tr><tr><td><a class="c1022523" href="../info/1900/9843.htm" title="招生公告">招生公告</a><span class="timestyle1022523">2026-09-01</span></td></tr></table>',
    ],
])('uses only one browser list request for %s, as required by the skill', async (route, type, html) => {
    const scrapeUrl = jest.fn().mockResolvedValue({ html });
    require('@/utils/puppy').getInstance.mockReturnValue({ scrapeUrl });
    const ctx = context(type);
    await require(`@/v2/${route}`)(ctx);
    expect(ctx.state.data.item).toHaveLength(1);
    expect(scrapeUrl).toHaveBeenCalledTimes(1);
    expect(got).not.toHaveBeenCalled();
    expect(ctx.cache.tryGet).not.toHaveBeenCalled();
});

it('maps the retired HBFU column and preserves the epoch timestamp', async () => {
    const dtime = 1777522563000;
    got.post.mockResolvedValueOnce({ data: { rows: [{ id: 55483, title: '招生通知', dtime }] } });
    got.post.mockResolvedValueOnce({ data: { content: '<p>正文</p>' } });
    const ctx = context('605');
    await require('@/v2/hbfu/yjs')(ctx);
    const form = new URLSearchParams(got.post.mock.calls[0][1].body);
    expect(form.get('navId')).toBe('2886');
    expect(form.get('pageSize')).toBe('20');
    expect(new Date(ctx.state.data.item[0].pubDate).getTime()).toBe(dtime);
});

it('uses the current CQMU notice list instead of fetching the whole homepage', async () => {
    got.mockResolvedValue({ data: '<ul class="n_listxx1"><li><h2><a href="../info/1119/2873.htm">招生公告</a><span class="time">2026-07-30</span></h2></li></ul>' });
    const ctx = context('tzgg-75');
    await require('@/v2/cqmu/yjszs')(ctx);
    expect(got.mock.calls[0][0]).toBe('https://yjszs.cqmu.edu.cn/index/tzgg.htm');
    expect(ctx.state.data.item).toHaveLength(1);
});

it.each([
    ['hebut/yjs/index', 'zsgztzgg', '<ul class="block-list64"><li><a class="gpTextArea" href="notice.htm"><span class="gpArticleDate">2026-07-03</span><p class="gpArticleTitle">硕士招生通知</p></a></li></ul>'],
    ['bigc/gs', 'yjszs-sszs-2026nzs', '<ul class="list03"><li><span>2026-06-12</span><a href="notice.htm">硕士招生通知</a></li></ul>'],
    ['hnucm/yjsy', 'zsxx-ssszs', '<div class="list-right"><ul class="list"><li><a href="../info/1095/5924.htm"><div>硕士招生通知</div><p>2026-07-03</p></a></li></ul></div>'],
    ['yangtzeu/gs', 'zsgz-sszs', '<div class="newlist1"><ul class="list"><li><a href="../info/1009/6091.htm"><h3>硕士招生通知</h3><span>2026-07-03</span></a></li></ul></div>'],
    ['bua/yz', 'tzgg', '<div class="text-list"><ul><li><span>2026-07-03</span><a href="../info/1231/3391.htm">硕士招生通知</a></li></ul></div>'],
    ['lyu/yjsc', '5046-list', '<ul class="wp_article_list"><li><span class="Article_Title"><a href="/2026/0330/c5046a258152/page.htm">硕士招生通知</a></span><span class="Article_PublishDate">2026-07-03</span></li></ul>'],
    [
        'sust/yjszs',
        'sszs-tzgg',
        '<ul class="article-list"><li><a href="../info/1014/4299.htm"><div class="art-date"><span class="day">03</span><span class="ym">2026-07</span></div><div class="art-body"><h3>硕士招生通知</h3><p>摘要</p></div></a></li></ul>',
    ],
])('parses the current %s admissions list', async (route, type, html) => {
    got.mockResolvedValue({ data: html });
    const ctx = context(type);
    await require(`@/v2/${route}`)(ctx);
    expect(ctx.state.data.item).toHaveLength(1);
    expect(ctx.state.data.item[0].title).toBe('硕士招生通知');
    expect(new Date(ctx.state.data.item[0].pubDate).toISOString()).toBe(route === 'bigc/gs' ? '2026-06-11T16:00:00.000Z' : '2026-07-02T16:00:00.000Z');
});
