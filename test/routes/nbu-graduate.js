const { getInstance } = require('@/utils/puppy');
const route = require('@/v2/nbu/graduate');

jest.mock('@/utils/puppy', () => ({ getInstance: jest.fn() }));
jest.mock('@/utils/got', () => jest.fn());

it('keeps the original Ningbo masters channel identity with HTTPS links and historical HTTP GUIDs', async () => {
    const base = 'https://graduate.nbu.edu.cn';
    const list = `${base}/zsgz/ssszs.htm`;
    const detail = `${base}/info/1073/29431.htm`;
    const title = '宁波大学2027年硕士研究生招生章程';
    const scrapeUrl = jest.fn()
        .mockResolvedValueOnce({
            html: `<h1 class="page-title">硕士生招生</h1><div id="main"><div class="inner-post"><div class="entry-header">
                <h4><a title=" ${title}" href="../info/1073/29431.htm">招生章程</a></h4>
                <span class="posted-on">2026-09-29</span><a href="ssszs.htm">硕士生招生</a>
            </div></div></div>`,
        })
        .mockResolvedValueOnce({ html: '<div class="v_news_content"><p>招生章程正文</p></div>' });
    getInstance.mockReturnValue({ scrapeUrl });
    const params = { type: 'zsgz-ssszs' };
    const ctx = { params, request: { params }, state: {}, cache: { tryGet: (_key, load) => load() } };

    await route(ctx);

    expect(scrapeUrl.mock.calls).toEqual([[list], [detail]]);
    expect(ctx.state.data.title).toBe('宁波大学研究生院 - 硕士生招生');
    expect(ctx.state.data.link).toBe(list);
    expect(ctx.state.data.item).toEqual([{
        title,
        link: detail,
        guid: 'http://graduate.nbu.edu.cn/info/1073/29431.htm',
        pubDate: new Date('2026-09-28T16:00:00.000Z'),
        description: '<p>招生章程正文</p>',
    }]);
});
