const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://gs.bigc.edu.cn',
    typeName: '研究生院',
    feedTitle: (typeName) => `北京印刷学院研究生院 - ${typeName.trim()}`,
    typeNameSelector: '.subBanner h3, .ins_right .title .name',
    listSelector: '.subPage .list03 > li, .text-list li',
    fetchDetail: true,
    detailContentSelector: '.pageArticle .article, .ins_right .content',
    detailDateParser: ($) =>
        $('meta[name="PubDate"]').attr('content') ||
        $('.ins_right .content h3')
            .text()
            .match(/时间[:：]\s*(.*?)\s*来源/)?.[1],
});
