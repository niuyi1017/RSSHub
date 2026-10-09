const got = require('@/utils/got');
const { getInstance } = require('@/utils/puppy');
const route = require('@/v2/gszy/yjsc');

jest.mock('@/utils/got', () => jest.fn());
jest.mock('@/utils/puppy', () => ({ getInstance: jest.fn() }));

it('通过 puppy 只采集硕士招生列表，标题排除日期并保留完整名称和原文链接', async () => {
    const host = 'https://yjsc.gszy.edu.cn';
    const pageUrl = `${host}/html/cid/91.html`;
    const fullTitle = '甘肃中医药大学2027年接收优秀应届本科毕业生免试攻读硕士学位研究生（含中医学专业“5+3”一体化学生转段）招生专业目录';
    const scrapeUrl = jest.fn().mockResolvedValue({
        html: `
            <aside class="list_news_ul"><div class="list_news_li"><a href="/sidebar.html">
                <span>2026-10-09</span><h3>侧栏新闻</h3>
            </a></div></aside>
            <div class="main_er_right">
                <div class="base_title"><div class="base_title1"><h3> 硕士招生 </h3></div></div>
                <div class="list_news"><div class="list_news_ul">
                    <div class="list_news_li"><a href="/show/id/5473.html">
                        <span><i></i>2026-09-18</span><h3> ${fullTitle} </h3><img src="/icon.png">
                    </a></div>
                    <div class="list_news_li"><a href="../../show/id/5474.html">
                        <span><i></i>2026-09-14</span><h3>甘肃中医药大学2027年硕士研究生考试招生简章</h3>
                    </a></div>
                </div></div>
                <div class="page"><a href="/html/cid/91.html?cid=91&page=2">下一页</a></div>
            </div>`,
    });
    got.mockReset();
    getInstance.mockReset();
    getInstance.mockReturnValue({ scrapeUrl });
    const ctx = { params: { type: '91' }, state: {} };

    await route(ctx);

    expect(ctx.state.data.title).toBe('甘肃中医药大学研究生院 - 硕士招生');
    expect(ctx.state.data.link).toBe(pageUrl);
    expect(ctx.state.data.item).toHaveLength(2);
    const [catalog, charter] = ctx.state.data.item;
    expect(catalog.title).toBe(fullTitle);
    expect(catalog.description).toBe(fullTitle);
    expect(catalog.link).toBe(`${host}/show/id/5473.html`);
    expect(catalog.pubDate.toISOString()).toBe('2026-09-17T16:00:00.000Z');
    expect(charter.link).toBe(`${host}/show/id/5474.html`);
    expect(charter.pubDate.toISOString()).toBe('2026-09-13T16:00:00.000Z');
    expect(getInstance).toHaveBeenCalledTimes(1);
    expect(scrapeUrl).toHaveBeenCalledTimes(1);
    expect(scrapeUrl).toHaveBeenCalledWith(pageUrl);
    expect(got).not.toHaveBeenCalled();
});
