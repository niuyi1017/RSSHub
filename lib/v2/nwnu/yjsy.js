const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjsy.nwnu.edu.cn',
    typeName: '研究生院',
    feedTitle: (typeName) => `西北师范大学研究生院 - ${typeName}`,
    fetchMethod: 'puppy',
    buildPageUrl: (host, type) => `${host}/${type}/list.htm`,
    typeNameSelector: '#main_left_top .on a',
    listSelector: '#AjaxList ul .a-list',
    listParser: { dateSelector: '.pdate' },
});
