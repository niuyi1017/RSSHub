const { createRoute } = require('@/v2/utils/news-list-template');

const columnIds = new Map([
    ['zhaoshenggongzuo', '17'],
    ['zszx', '266'],
    ['zsjz', '267'],
    ['zhuanyemulu', '268'],
    ['lnfsfsx', '269'],
]);

module.exports = createRoute({
    host: 'https://yjsxy.sdpei.edu.cn',
    typeName: '招生工作',
    feedTitle: (typeName) => `山东体育学院研究生教育学院 - ${typeName}`,
    buildPageUrl: (host, type) => {
        const columnId = columnIds.get(type);
        return columnId ? `${host}/${columnId}/list.htm` : `${host}/news-list-${type}.html`;
    },
    typeNameSelector: '.Column_Anchor',
    listSelector: '#newslist .newslist_title > ul > li, #newslist_title ul li',
    fetchDetail: true,
    detailContentSelector: 'div[style*="border-top:3px solid #1d89c5"]',
    gotOptions: { https: { rejectUnauthorized: true } },
});
