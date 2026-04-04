const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://sites.lynu.edu.cn',
    typeName: '研究生与学科建设处',
    feedTitle: (typeName) => `洛阳师范学院研究生与学科建设处 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/yjs_xk/${type}.htm`,
    typeNameSelector: '#topleft_word2 a:last-child',
    listSelector: '#list_left > ul > li',
    listParser: {
        dateSelector: '#span_right',
        dateTransform: (d) => d.replace(/[()]/g, ''),
    },
    fetchDetail: true,
    detailContentSelector: '#vsb_content',
});
