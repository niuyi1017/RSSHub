const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://gs.ncepu.edu.cn',
    typeName: '最新信息',
    feedTitle: (typeName) => `华北电力大学（保定）研究生院 - ${typeName}`,
    typeNameSelector: 'dl.vlist-box.arrow-list dt strong',
    listSelector: 'dl.vlist-box.arrow-list dd ul li',
    fetchDetail: true,
    detailContentSelector: '.viewbox .content',
});
