const got = require('@/utils/got');
const { getLimit, mapItems, compactDescription } = require('@/v2/utils/admission-feed');

const BASE = 'https://news.hbfu.edu.cn';
const PARENT_ID = '604';
const PARENT_NAME = '招生就业';

async function postForm(path, form) {
    const { data } = await got.post(`${BASE}${path}`, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(form).toString(),
        https: { rejectUnauthorized: false },
    });
    return data;
}

function contentLink(contentId, parentId = PARENT_ID, parentName = PARENT_NAME) {
    const q = new URLSearchParams({
        contentId: String(contentId),
        parentId,
        parentName,
    });
    return `${BASE}/yjs/ContentPage?${q.toString()}`;
}

module.exports = async (ctx) => {
    const navId = ctx.params.type === '605' ? '2886' : ctx.params.type;
    if (!/^\d+$/.test(navId)) {
        throw new Error('栏目参数应为栏目 navId 数字，如 605、606');
    }
    const isAdmissions = ['2886', '2887', '2888', '2889'].includes(navId);
    const parentId = isAdmissions ? '2885' : PARENT_ID;
    const parentName = isAdmissions ? '研究生招生' : PARENT_NAME;

    const listData = await postForm('/web/queryContentList', {
        pageIndex: '1',
        pageSize: String(getLimit(ctx)),
        navId,
    });

    const rows = (listData.rows || []).slice(0, getLimit(ctx));
    const columnName = rows[0]?.navigation?.name || `栏目${navId}`;
    const listPageUrl = `${BASE}/yjs/ListPage?parentId=${parentId}&parentName=${encodeURIComponent(parentName)}&childId=${navId}&flag=0`;
    if (!rows.length) {
        throw new Error(`No admission items found: ${listPageUrl}`);
    }

    const items = await mapItems(rows, (row) =>
        ctx.cache.tryGet(contentLink(row.id, parentId, parentName), async () => {
            const detail = await postForm('/web/queryContentById', { contentId: String(row.id) });
            let description = detail.content || detail.title || '';
            if (detail.fileList?.length) {
                for (const f of detail.fileList) {
                    description += `<p><a href="${BASE}/web/downloadFile?fileId=${f.id}">${f.fileName}</a></p>`;
                }
            }
            return {
                title: row.title,
                link: contentLink(row.id, parentId, parentName),
                pubDate: new Date(row.dtime),
                description: compactDescription(description, contentLink(row.id, parentId, parentName)),
            };
        })
    );

    ctx.state.data = {
        title: `河北金融学院研究生部 - ${columnName}`,
        link: isAdmissions ? `${BASE}/yjs` : listPageUrl,
        description: `河北金融学院研究生部 - ${columnName}`,
        item: items.map((item) => ({ ...item, description: compactDescription(item.description, item.link) })),
    };
};
