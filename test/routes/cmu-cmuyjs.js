const got = require('@/utils/got');
const { getInstance } = require('@/utils/puppy');
const route = require('@/v2/cmu/cmuyjs');
const radar = require('@/v2/cmu/radar');

jest.mock('@/utils/got', () => jest.fn());
jest.mock('@/utils/puppy', () => ({ getInstance: jest.fn() }));

it('仅采集统考硕士列表中的有效公告，保留完整标题和日期，并通过正确的域名识别路由', async () => {
    const pageUrl = 'https://www.cmu.edu.cn/cmuyjs/zsxx/tkss.htm';
    const fullTitle = '关于中国医科大学2026年硕士研究生招生统考拟录取考生确认拟录取类别的通知';
    const scrapeUrl = jest.fn().mockResolvedValue({
        html: `
            <span class="currentfontstyle1022520">\n统考硕士\n</span>
            <table><tr><td><a class="c1022523" href="sidebar.htm">侧栏文章</a></td></tr></table>
            <table class="winstyle1022523"><tbody>
                <tr><td>分隔行</td></tr>
                <tr><td><a class="c1022523" href="../info/1900/9827.htm" title="${fullTitle}">关于中国医科大学2026年硕士研究生招生统考拟录取...</a></td>
                    <td><span class="timestyle1022523">2026/04/25&nbsp;</span></td></tr>
                <tr><td><table><tr><td>空白嵌套行</td></tr></table></td></tr>
                <tr><td><a class="c1022523" href="https://www.cmu.edu.cn/cmuyjs/info/1900/9843.htm">中国医科大学2027年硕士研究生招生考试部分初试科目调整公告</a></td>
                    <td><span class="timestyle1022523"> 2026/06/05&nbsp; </span></td></tr>
            </tbody></table>
            <table class="pagination"><tr><td><a href="tkss/1.htm">下一页</a></td></tr></table>`,
    });
    getInstance.mockReturnValue({ scrapeUrl });
    const ctx = { params: { type: 'zsxx-tkss' }, state: {} };

    await route(ctx);

    expect(ctx.state.data.title).toBe('中国医科大学研究生院 - 统考硕士');
    expect(ctx.state.data.link).toBe(pageUrl);
    expect(ctx.state.data.item).toHaveLength(2);
    expect(ctx.state.data.item[0]).toMatchObject({
        title: fullTitle,
        link: 'https://www.cmu.edu.cn/cmuyjs/info/1900/9827.htm',
        description: fullTitle,
    });
    expect(ctx.state.data.item[0].pubDate.toISOString()).toBe('2026-04-24T16:00:00.000Z');
    expect(ctx.state.data.item[1].pubDate.toISOString()).toBe('2026-06-04T16:00:00.000Z');
    expect(scrapeUrl).toHaveBeenCalledTimes(1);
    expect(scrapeUrl).toHaveBeenCalledWith(pageUrl);
    expect(got).not.toHaveBeenCalled();
    const source = radar['cmu.edu.cn'].www[0];
    expect(source.source).toEqual(['/cmuyjs/zsxx/:type.htm']);
    expect(source.target({ type: 'tkss' })).toBe('/cmu/cmuyjs/zsxx-tkss');
});
