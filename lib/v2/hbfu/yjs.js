const got = require('@/utils/got');
const timezone = require('@/utils/timezone');

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

function contentLink(contentId) {
  const q = new URLSearchParams({
    contentId: String(contentId),
    parentId: PARENT_ID,
    parentName: PARENT_NAME,
  });
  return `${BASE}/yjs/ContentPage?${q.toString()}`;
}

module.exports = async (ctx) => {
  const navId = ctx.params.type;
  if (!/^\d+$/.test(navId)) {
    throw new Error('栏目参数应为栏目 navId 数字，如 605、606');
  }

  const listData = await postForm('/web/queryContentList', {
    pageIndex: '1',
    pageSize: '100',
    navId,
  });

  const rows = listData.rows || [];
  const columnName = rows[0]?.navigation?.name || `栏目${navId}`;
  const listPageUrl = `${BASE}/yjs/ListPage?parentId=${PARENT_ID}&parentName=${encodeURIComponent(PARENT_NAME)}&childId=${navId}&flag=0`;

  const items = await Promise.all(
    rows.map((row) =>
      ctx.cache.tryGet(contentLink(row.id), async () => {
        const detail = await postForm('/web/queryContentById', { contentId: String(row.id) });
        let description = detail.content || detail.title || '';
        if (detail.fileList?.length) {
          for (const f of detail.fileList) {
            description += `<p><a href="${BASE}/web/downloadFile?fileId=${f.id}">${f.fileName}</a></p>`;
          }
        }
        return {
          title: row.title,
          link: contentLink(row.id),
          pubDate: timezone(new Date(row.dtime), 8),
          description,
        };
      })
    )
  );

  ctx.state.data = {
    title: `河北金融学院研究生部 - ${columnName}`,
    link: listPageUrl,
    description: `河北金融学院研究生部 - ${columnName}`,
    item: items,
  };
};
