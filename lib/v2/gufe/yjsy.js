const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjsy.gufe.edu.cn',
    typeName: '招生工作',
    feedTitle: (typeName) => `贵州财经大学研究生院 - ${typeName.trim()}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '.n_tit h2',
    listSelector: '.inner_s1 > ul > li',
    listParser: {
        dateSelector: 'time',
        dateTransform: (date) => date.trim().replace(/^(\d{2}-\d{2})\s*(\d{4})$/, '$2-$1'),
    },
    fetchDetail: true,
    detailContentSelector: '.detail #vsb_content',
    detailExtraSelectors: ['.detail ul[style="list-style-type:none;"]'],
});
