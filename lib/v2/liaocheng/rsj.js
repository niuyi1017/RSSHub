const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'http://rsj.liaocheng.gov.cn',
    typeName: '人事考试及人才评价',
    feedTitle: (typeName) => `聊城市人社局 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/channel_${type}/`,
    typePreprocess: (type) => type,
    typeNameSelector: '.wbj_list_1 .left .title',
    listSelector: '.wbj_list_1 .item',
    listParser: { dateSelector: 'span.time' },
    fetchDetail: true,
    detailContentSelector: '.wbj_details_1 .content-text',
});
