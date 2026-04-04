const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjs.hebeinu.edu.cn',
    typeName: '通知公告',
    feedTitle: (typeName) => `河北北方学院研究生学院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/index.php?s=/List/index/cid/${type}.html`,
    typeNameSelector: '.tmenu .tmenuon',
    listSelector: '.side_main .list ul li',
    listParser: {
        dateSelector: 'h5',
        linkSelector: 'h4 a',
        dateTransform: (date) => date.replace('日期：', '').trim().replace(/\./g, '/'),
    },
    fetchDetail: true,
    detailContentSelector: '.article .article_con',
});
