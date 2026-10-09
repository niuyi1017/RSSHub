jest.mock('@/utils/got', () => jest.fn());

const got = require('@/utils/got');
const { createRoute } = require('@/v2/utils/news-list-template');

const host = 'https://rsshub.test';
const itemUrl = `${host}/article.htm`;
const listHtml = (date = '') => `<ul><li><a href="/article.htm" title="Article">Article</a><span>${date}</span></li></ul>`;
const detailHtml = '<main><p>Body</p></main><aside><a href="/file.pdf">File</a></aside><time>2026-10-08 15:54:02</time>';
const config = {
    host,
    feedTitle: () => 'News',
    listSelector: 'li',
    fetchDetail: true,
    detailContentSelector: 'main',
    detailExtraSelectors: ['aside'],
};
const createContext = () => ({
    params: { type: 'notices' },
    state: {},
    cache: { tryGet: jest.fn((key, callback) => callback()) },
});

beforeEach(() => got.mockReset());

describe('news list template', () => {
    it.each([false, true])('preserves existing detail HTML and prefers the valid list date (custom parser: %s)', async (customParser) => {
        got.mockResolvedValueOnce({ data: listHtml('2026-10-07') }).mockResolvedValueOnce({ data: detailHtml });
        const ctx = createContext();
        const detailParser = customParser
            ? jest.fn(($, url) => {
                  expect(url).toBe(itemUrl);
                  return Promise.resolve($('main').html());
              })
            : undefined;

        await createRoute({ ...config, detailParser, detailDateParser: ($) => $('time').text() })(ctx);

        expect(ctx.state.data.item).toEqual([
            {
                title: 'Article',
                link: itemUrl,
                description: customParser ? '<p>Body</p>' : '<p>Body</p><a href="/file.pdf">File</a>',
                pubDate: new Date('2026-10-06T16:00:00.000Z'),
            },
        ]);
    });

    it.each([
        ['string', undefined, '2026-10-08 15:54:02'],
        ['Date', '>', new Date(2026, 9, 8, 15, 54, 2)],
    ])('uses a detail %s when the list date is missing or invalid', async (format, listDate, detailDate) => {
        got.mockResolvedValueOnce({ data: listHtml() }).mockResolvedValueOnce({ data: detailHtml });
        const ctx = createContext();
        const detailDateParser = jest.fn(($, url) => {
            expect(url).toBe(itemUrl);
            expect($('time').text()).toBe('2026-10-08 15:54:02');
            return detailDate;
        });

        await createRoute({
            ...config,
            listItemParser: () => ({ title: 'Directory', link: itemUrl, date: listDate }),
            detailDateParser,
        })(ctx);

        expect(ctx.state.data.item[0].pubDate).toEqual(new Date('2026-10-08T07:54:02.000Z'));
        expect(ctx.state.data.item[0].description).toContain('<p>Body</p>');
        expect(detailDateParser).toHaveBeenCalledTimes(1);
    });

    it.each([false, true])('omits missing and invalid dates without inventing the current time (fetch detail: %s)', async (fetchDetail) => {
        const dates = [undefined, null, '', '   ', '>', new Date(NaN)];
        const html = `<ul>${dates.map((date, index) => `<li data-index="${index}"></li>`).join('')}</ul>`;
        got.mockImplementation((url) => Promise.resolve({ data: url === `${host}/notices/index.htm` ? html : detailHtml }));
        const ctx = createContext();

        await createRoute({
            ...config,
            fetchDetail,
            listItemParser: ($item) => {
                const index = Number($item.attr('data-index'));
                return { title: `Article ${index}`, link: `${host}/${index}.htm`, date: dates[index] };
            },
            detailDateParser: () => 'not a date',
        })(ctx);

        expect(ctx.state.data.item).toHaveLength(dates.length);
        for (const item of ctx.state.data.item) {
            expect(item).not.toHaveProperty('pubDate');
        }
    });

    it('keeps the title and valid list date when fetching the detail fails', async () => {
        got.mockResolvedValueOnce({ data: listHtml('2026-10-07') }).mockRejectedValueOnce(new Error('Detail unavailable'));
        const ctx = createContext();

        await createRoute(config)(ctx);

        expect(ctx.state.data.item).toEqual([
            {
                title: 'Article',
                link: itemUrl,
                description: 'Article',
                pubDate: new Date('2026-10-06T16:00:00.000Z'),
            },
        ]);
    });
});

describe('admission safeguards with detail parsing', () => {
    it('filters duplicate and invalid links while keeping detail dates, body text and absolute attachments', async () => {
        const secondUrl = `${host}/second.htm`;
        const html = `<ul>
            <li><a href="/article.htm" title=" Article ">Article</a></li>
            <li><a href="/article.htm" title="Duplicate">Duplicate</a></li>
            <li><a href="/blank.htm" title=" "> </a></li>
            <li><a href="mailto:admissions@example.com" title="Email">Email</a></li>
            <li><a href="/second.htm" title="Second">Second</a><span>2026-10-07</span></li>
            <li><a href="/third.htm" title="Third">Third</a></li>
        </ul>`;
        got.mockImplementation((url) =>
            Promise.resolve({
                data: url === `${host}/notices/index.htm` ? html : '<main><p style="color:red" class="body">Body</p><a href="/file.pdf">File</a><script>track()</script></main><time>2026-10-08 15:54:02</time>',
            })
        );
        const ctx = { ...createContext(), query: { limit: '2' } };

        await createRoute({ ...config, admission: true, detailParser: ($) => $('main').html(), detailDateParser: ($) => $('time').text() })(ctx);

        expect(ctx.state.data.item.map((item) => item.link)).toEqual([itemUrl, secondUrl]);
        expect(ctx.state.data.item[0].title).toBe('Article');
        expect(ctx.state.data.item[0].pubDate).toEqual(new Date('2026-10-08T07:54:02.000Z'));
        expect(ctx.state.data.item[1].pubDate).toEqual(new Date('2026-10-06T16:00:00.000Z'));
        expect(ctx.state.data.item[0].description).toContain('<p>Body</p>');
        expect(ctx.state.data.item[0].description).toContain(`<a href="${host}/file.pdf">File</a>`);
        expect(ctx.state.data.item[0].description).not.toMatch(/<script|style=|class=|\[object Object\]/);
        expect(got.mock.calls.map(([url]) => url)).toEqual([`${host}/notices/index.htm`, itemUrl, secondUrl]);
    });

    it('bounds large admission lists and concurrent details without losing article order or download links', async () => {
        const html = `<ul>${Array.from({ length: 25 }, (_, index) => `<li><a href="/${index}.htm" title="Article ${index}">Article ${index}</a><span>2026-10-08</span></li>`).join('')}</ul>`;
        const roster = `<main><p>${'录取名单'.repeat(15000)}</p><a href="/roster.xlsx">下载完整名单</a></main>`;
        let active = 0;
        let peak = 0;
        got.mockImplementation(async (url) => {
            if (url === `${host}/notices/index.htm`) {
                return { data: html };
            }
            active++;
            peak = Math.max(peak, active);
            await new Promise((resolve) => setTimeout(resolve, 1));
            active--;
            return { data: roster };
        });
        const ctx = { ...createContext(), query: { limit: '100' } };

        await createRoute({ ...config, admission: true })(ctx);

        expect(ctx.state.data.item).toHaveLength(20);
        expect(peak).toBeLessThanOrEqual(3);
        expect(ctx.state.data.item.map((item) => item.title)).toEqual(Array.from({ length: 20 }, (_, index) => `Article ${index}`));
        for (const item of ctx.state.data.item) {
            expect(Buffer.byteLength(item.description)).toBeLessThan(128 * 1024);
            expect(item.description).toContain(`<a href="${host}/roster.xlsx">下载完整名单</a>`);
            expect(item.description).toContain(item.link);
            expect(item.pubDate).toEqual(new Date('2026-10-07T16:00:00.000Z'));
        }
        expect(Buffer.byteLength(JSON.stringify(ctx.state.data))).toBeLessThan(5242880);
        expect(got).toHaveBeenCalledTimes(21);
    });
});
