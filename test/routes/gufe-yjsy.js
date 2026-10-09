const got = require('@/utils/got');
const cheerio = require('cheerio');
const route = require('@/v2/gufe/yjsy');

jest.mock('@/utils/got', () => jest.fn());

it('解析月日和年份分开的招生公告，保留咨询电话、招生章程和正文外附件', async () => {
    const host = 'https://yjsy.gufe.edu.cn';
    const pageUrl = `${host}/zsgz.htm`;
    const phoneUrl = `${host}/info/1005/2432.htm`;
    const charterUrl = `${host}/info/1005/2431.htm`;
    const fullTitle = '贵州财经大学2027年硕士研究生招生章程';
    const attachment = '/system/_content/download.jsp?urltype=news.DownloadAttachUrl&owner=1796144561&wbfileid=18523955';
    const pages = {
        [pageUrl]: `
            <aside><ul><li><a href="navigation.htm">导航</a></li></ul></aside>
            <div class="n_tit"><h2> 招生工作\n</h2></div>
            <div class="inner_s1"><ul>
                <li><a href="info/1005/2432.htm" title="2027年硕士研究生招生咨询电话"><time><span>10-08</span>2026</time><h3>2027年硕士研究生招生咨询电话</h3></a></li>
                <span hidden><hr></span>
                <li><a href="info/1005/2431.htm" title="${fullTitle}"><time><span>09-30</span>2026</time><h3>贵州财经大学2027年硕士...</h3></a></li>
            </ul><div class="pb_sys_common"><a href="zsgz/25.htm">下一页</a></div></div>`,
        [phoneUrl]: `
            <div class="detail"><h1>2027年硕士研究生招生咨询电话</h1>
            <div id="vsb_content" class="dtl_txt"><div class="v_news_content"><div id="vsb_content"><div class="v_news_content">
            <p>经济学院 <span>0851-88510571</span></p><p>应用经济学院 <span>0851-88510575</span></p>
            </div></div></div></div><div class="dtl_page">下一篇</div></div>`,
        [charterUrl]: `
            <div class="detail"><h1>${fullTitle}</h1>
            <div id="vsb_content" class="dtl_txt"><div class="v_news_content"><div id="vsb_content"><div class="v_news_content"><p>一、招生计划</p></div></div></div></div>
            <ul style="list-style-type:none;"><li>附件【<a href="${attachment}">附件1：贵州财经大学2027年硕士研究生招生专业目录.pdf</a>】</li></ul>
            <div class="dtl_page">下一篇：旧通知</div></div><footer>网站导航</footer>`,
    };
    got.mockImplementation((url) => {
        if (!Object.prototype.hasOwnProperty.call(pages, url)) {
            throw new Error(`未预期的抓取地址：${url}`);
        }
        return Promise.resolve({ data: pages[url] });
    });
    const ctx = { params: { type: 'zsgz' }, state: {}, cache: { tryGet: (_, load) => load() } };

    await route(ctx);

    expect(ctx.state.data.title).toBe('贵州财经大学研究生院 - 招生工作');
    expect(ctx.state.data.link).toBe(pageUrl);
    expect(ctx.state.data.item).toHaveLength(2);
    const [phone, charter] = ctx.state.data.item;
    expect(phone.title).toBe('2027年硕士研究生招生咨询电话');
    expect(phone.link).toBe(phoneUrl);
    expect(phone.pubDate.toISOString()).toBe('2026-10-07T16:00:00.000Z');
    expect(cheerio.load(phone.description)('p').text()).toBe('经济学院 0851-88510571应用经济学院 0851-88510575');
    expect(charter.title).toBe(fullTitle);
    expect(charter.link).toBe(charterUrl);
    expect(charter.pubDate.toISOString()).toBe('2026-09-29T16:00:00.000Z');
    expect(charter.description).toContain('一、招生计划');
    expect(charter.description).not.toMatch(/下一篇|旧通知|网站导航/);
    const $ = cheerio.load(charter.description);
    expect($('a')).toHaveLength(1);
    expect($('a').attr('href')).toBe(`${host}${attachment}`);
    expect($('a').text()).toBe('附件1：贵州财经大学2027年硕士研究生招生专业目录.pdf');
    expect(got.mock.calls.map(([url]) => url)).toEqual([pageUrl, phoneUrl, charterUrl]);
});
