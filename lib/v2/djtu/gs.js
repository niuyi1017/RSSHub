const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://gs.djtu.edu.cn',
    typeName: '研究生工作处',
    feedTitle: (typeName) => `大连交通大学研究生工作处 - ${typeName}`,
    typePreprocess: (type) => type,
    buildPageUrl: (host, type) => {
        const [mid, tpid] = type.split('-');
        return tpid ? `${host}/${mid}.html?tpid=${tpid}` : `${host}/${mid}.html`;
    },
    typeNameSelector: '.m .totitle i',
    listSelector: 'ul.list li',
    listParser: { dateSelector: '.sdate' },
    fetchDetail: true,
    detailContentSelector: '.minfo .content',
});
