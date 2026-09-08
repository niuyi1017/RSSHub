const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    admission: true,
    host: 'https://gs.bigc.edu.cn',
    typeName: '硕士招生',
    feedTitle: (typeName) => `北京印刷学院研究生院 - ${typeName}`,
    listSelector: '.list03 li',
    fetchDetail: true,
    detailContentSelector: '.article',
});
