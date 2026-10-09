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
