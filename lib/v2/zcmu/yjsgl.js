const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjsgl.zcmu.edu.cn',
    typeName: '研究生院',
    feedTitle: (typeName) => `浙江中医药大学研究生院 - ${typeName}`,
    fetchMethod: 'puppy',
    typePreprocess: (type) => type,
    buildPageUrl: (host, type) => `${host}/list/${type}`,
    typeNameSelector: '.conts-list .title h2',
    listSelector: '.conts-list .list li',
    listParser: { dateSelector: '.time' },
});
