const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const host = 'https://grszs.syuct.edu.cn';

const gotOpts = {
  headers: { token: '' },
  https: { rejectUnauthorized: false },
  dnsLookupIpVersion: 'ipv4',
};

function findChannelName(channels, source) {
  if (!Array.isArray(channels)) {
    return null;
  }
  const s = String(source);
  for (const ch of channels) {
    if (String(ch.link) === s) {
      return ch.name;
    }
    const subs = ch.webNavLevels;
    if (subs?.length) {
      for (const sub of subs) {
        if (sub.type === 0 && String(sub.link) === s) {
          return sub.name;
        }
      }
    }
  }
  return null;
}

module.exports = async (ctx) => {
  const { source } = ctx.params;

  const listRes = await got({
    url: `${host}/cloud/apis/stationgroup/pub/module/get/source`,
    searchParams: { pageNum: 1, pageSize: 30, source },
    ...gotOpts,
  }).json();

  let channelName = `栏目 ${source}`;
  try {
    const chRes = await got({
      url: `${host}/cloud/apis/stationgroup/pub/web/channel`,
      ...gotOpts,
    }).json();
    channelName = findChannelName(chRes?.data, source) || channelName;
  } catch {
    // 导航接口失败时仍输出列表
  }

  const page = listRes?.data;
  const records = page?.records ?? [];
  const listLink = `${host}/list2.html?source=${source}`;

  const items = await Promise.all(
    records.map((item) => {
      const id = item.idStr ?? item.id;
      const divcol = item.divcol ?? '';
      const link = `${host}/content.html?id=${encodeURIComponent(id)}&divcol=${encodeURIComponent(divcol)}`;
      const pubRaw = item.pubtime ?? item.pubTime;
      const pubDate = timezone(parseDate(pubRaw), 8);

      return ctx.cache.tryGet(link, async () => {
        let description = item.title;
        try {
          const detail = await got({
            url: `${host}/cloud/apis/stationgroup/pub/web/details`,
            searchParams: { id, divcol },
            ...gotOpts,
          }).json();
          const d = detail?.data;
          const art = d?.art;
          const articleContent = d?.articleContent;
          if (art?.type === 1 && articleContent?.content) {
            description = articleContent.content;
          } else if (art?.type === 2 && art.url) {
            description = art.covers
              ? `<p><video controls preload="none" width="100%" height="400" poster="${art.covers}" src="${art.url}"></video></p>`
              : `<p><a href="${art.url}">视频</a></p>`;
          } else if (art?.type === 3 && art.url) {
            description = `<p><a href="${art.url}">原文链接</a></p>`;
          }
        } catch {
          // 详情失败时用标题
        }
        return {
          title: item.title,
          link,
          pubDate,
          description,
        };
      });
    })
  );

  ctx.state.data = {
    title: `沈阳化工大学研究生院 - ${channelName}`,
    link: listLink,
    description: `${channelName} - ${listLink}`,
    item: items,
  };
};
