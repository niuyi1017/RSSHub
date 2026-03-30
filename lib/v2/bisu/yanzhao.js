const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yanzhao.bisu.edu.cn',
  typeName: '最新公告',
  feedTitle: (typeName) => `北京第二外国语学院研究生招生网 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/mixmedia/${type}`,
  typePreprocess: (type) => type,
  typeNameSelector: '.banner .w1366 p',
  listSelector: 'ul.List li',
  listItemParser: ($item, $) => {
    const div = $item.find('div[data-id]');
    const storyId = div.attr('data-id');
    const title = div.find('p').text().trim();
    const date = div.find('span').text().trim();
    const link = storyId ? `https://yanzhao.bisu.edu.cn/content/${storyId}.html` : '';
    return { title, link, date };
  },
  fetchDetail: true,
  detailContentSelector: '.detail-content',
});
