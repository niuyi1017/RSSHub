const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    admission: true,
    host: 'https://wgyxy.henau.edu.cn',
    typeName: '外国语学院',
    feedTitle: (typeName) => `河南农业大学外国语学院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typePreprocess: (type) => (type === '42' ? 'index/tzgg' : type.replace(/-/g, '/')),
    typeNameSelector: '.list_l a.cur',
    listSelector: '.text-list li',
    listParser: { dateSelector: '.ddd' },
    fetchDetail: true,
    detailContentSelector: '.v_news_content',
});
