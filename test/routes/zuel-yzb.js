const got = require('@/utils/got');
const { getInstance } = require('@/utils/puppy');
const route = require('@/v2/zuel/yzb');

jest.mock('@/utils/got', () => jest.fn());
jest.mock('@/utils/puppy', () => ({ getInstance: jest.fn() }));

it('通过 puppy 只采集指定招生栏目列表，保留完整标题、HTTPS 原文链接和日期', async () => {
    const host = 'https://yzb.zuel.edu.cn';
    const fullTitle = '中南财经政法大学2027年硕士研究生招生简章及专业目录';
    const scrapeUrl = jest.fn().mockResolvedValue({
        html: `
            <div class="col_title"><h2> 硕士研究生 </h2></div>
            <div id="wp_news_w6"><ul class="news_list">
                <li class="news">
                    <div class="news_title"><a href="/2026/0930/c4643a456789/page.htm" title="${fullTitle}">硕士研究生招生简章...</a></div>
                    <div class="news_meta">2026-09-30</div>
                </li>
                <li class="news">
                    <div class="news_title"><a href="../2026/0911/c4643a456700/page.htm" title="硕士招生考试通知">硕士招生考试通知</a></div>
                    <div class="news_meta">2026-09-11</div>
                </li>
            </ul></div>
            <div id="wp_news_w7"><ul class="news_list"><li class="news">
                <div class="news_title"><a href="/other/page.htm" title="其他栏目通知">其他栏目通知</a></div>
                <div class="news_meta">2026-09-01</div>
            </li></ul></div>`,
    });
    got.mockReset();
    getInstance.mockReset();
    getInstance.mockReturnValue({ scrapeUrl });
    const ctx = { params: { type: '4643' }, state: {} };

    await route(ctx);

    expect(ctx.state.data.title).toBe('中南财经政法大学研究生招生网 - 硕士研究生');
    expect(ctx.state.data.link).toBe(`${host}/4643/list.htm`);
    expect(ctx.state.data.item).toHaveLength(2);
    const [charter, notice] = ctx.state.data.item;
    expect(charter.title).toBe(fullTitle);
    expect(charter.description).toBe(fullTitle);
    expect(charter.link).toBe(`${host}/2026/0930/c4643a456789/page.htm`);
    expect(charter.pubDate.toISOString()).toBe('2026-09-29T16:00:00.000Z');
    expect(notice.link).toBe(`${host}/2026/0911/c4643a456700/page.htm`);
    expect(notice.pubDate.toISOString()).toBe('2026-09-10T16:00:00.000Z');
    expect(getInstance).toHaveBeenCalledTimes(1);
    expect(scrapeUrl).toHaveBeenCalledTimes(1);
    expect(scrapeUrl).toHaveBeenCalledWith(`${host}/4643/list.htm`);
    expect(got).not.toHaveBeenCalled();
});
