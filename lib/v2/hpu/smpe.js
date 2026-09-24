const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    admission: true,
    host: 'https://smpe.hpu.edu.cn',
    typeName: '招生管理',
    feedTitle: (typeName) => `河南理工大学机械与动力工程学院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typePreprocess: (type) => (type === 'yjsjy-zsgl' ? 'zsjy/yjszs/zsgl' : type.replace(/-/g, '/')),
    typeNameSelector: '.posl',
    listSelector: '.list ul li',
    fetchDetail: true,
    detailContentSelector: '.warpper .content',
});
