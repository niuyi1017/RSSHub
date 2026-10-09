const got = require('@/utils/got');
const cheerio = require('cheerio');
const route = require('@/v2/hnucm/yjsy');

jest.mock('@/utils/got', () => jest.fn());

it('采集招生公告完整标题和日期，保留脚本 PDF 与正文外附件，排除侧栏和分页', async () => {
    const host = 'https://yjsy.hnucm.edu.cn';
    const pageUrl = `${host}/zsxx/tzgg.htm`;
    const pdfUrl = `${host}/info/1092/6725.htm`;
    const planUrl = `${host}/info/1092/6717.htm`;
    const pdfPath = '/__local/9/2D/73/918BA7E2625FC4F26B7EF76C2AF_68D4028A_2033A.pdf';
    const attachment = '/system/_content/download.jsp?urltype=news.DownloadAttachUrl&owner=1305969438&wbfileid=17917335';
    const fullTitle = '2027年全国硕士研究生招生考试湖南中医药大学报考点(4311)公告';
    const planTitle = '湖南中医药大学2027年各二级招生单位接受推荐免试攻读硕士学位研究生及八年制转段生复试录取工作方案';
    const pages = {
        [pageUrl]: `
            <aside><ul class="list"><li><a href="zsjz.htm">招生简章</a></li></ul></aside>
            <div class="list-right"><div class="list-dq"><h3>\n 通知公告</h3></div><ul class="list">
                <li><a href="../info/1092/6725.htm" title="${fullTitle}"><div>2027年全国硕士研究生招生...</div><p>2026-10-08</p></a></li>
                <span><hr></span>
                <li><a href="../info/1092/6717.htm" title="${planTitle}"><div>推免生复试方案...</div><p>2026-09-23</p></a></li>
            </ul><div class="pagination"><a href="tzgg/16.htm">下一页</a></div></div>`,
        [pdfUrl]: `
            <div class="content"><h1>${fullTitle}</h1><div class="label">2026年10月08日 点击次数</div>
                <div id="vsb_content"><div class="v_news_content"><p>
                    <script>var vsb_pdf_image_data=[];showVsbpdfIframe("${pdfPath}","100%","600","6");</script>
                </p></div></div><p>下一条：<a href="6717.htm">下一篇</a></p>
            </div>`,
        [planUrl]: `
            <div class="content"><h1>${planTitle}</h1><div class="label">2026年09月23日 点击次数</div>
                <div id="vsb_content"><div class="v_news_content"><p>二级招生单位复试工作方案正文</p></div></div>
                <div id="div_vote_id"></div><p><ul style="list-style-type:none;">
                    <li>附件【<a href="${attachment}">022附属长沙市中医医院2027年八年制转段复试工作方案.pdf</a>】</li>
                </ul></p><p>上一条：<a href="6725.htm">上一篇</a></p>
            </div>`,
    };
    got.mockImplementation((url) => {
        if (!Object.prototype.hasOwnProperty.call(pages, url)) {
            throw new Error(`未预期的抓取地址：${url}`);
        }
        return Promise.resolve({ data: pages[url] });
    });
    const ctx = { params: { type: 'zsxx-tzgg' }, state: {}, cache: { tryGet: (_, load) => load() } };

    await route(ctx);

    expect(ctx.state.data.title).toBe('湖南中医药大学研究生院 - 通知公告');
    expect(ctx.state.data.link).toBe(pageUrl);
    expect(ctx.state.data.item).toHaveLength(2);
    const [pdf, plan] = ctx.state.data.item;
    expect(pdf.title).toBe(fullTitle);
    expect(pdf.link).toBe(pdfUrl);
    expect(pdf.pubDate.toISOString()).toBe('2026-10-07T16:00:00.000Z');
    const $pdf = cheerio.load(pdf.description);
    expect($pdf('a').attr('href')).toBe(`${host}${pdfPath}`);
    expect($pdf('a').text()).toBe('查看 PDF');
    expect($pdf('script')).toHaveLength(0);
    expect(plan.title).toBe(planTitle);
    expect(plan.link).toBe(planUrl);
    expect(plan.pubDate.toISOString()).toBe('2026-09-22T16:00:00.000Z');
    expect(plan.description).toContain('二级招生单位复试工作方案正文');
    const $plan = cheerio.load(plan.description);
    expect($plan('a')).toHaveLength(1);
    expect($plan('a').attr('href')).toBe(`${host}${attachment}`);
    expect(`${pdf.description}${plan.description}`).not.toMatch(/点击次数|上一条|下一条/);
    expect(got.mock.calls.map(([url]) => url)).toEqual([pageUrl, pdfUrl, planUrl]);
});
