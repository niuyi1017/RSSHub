const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjsglxt.swun.edu.cn',
    typeName: '研究生院',
    feedTitle: (typeName) => `西南民族大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    fetchMethod: 'puppy',
    typeNameSelector: '.position h3',
    listSelector: '.wslb ul li',
    listParser: {
        dateSelector: '.lbt p',
        dateTransform: (d) => {
            const m = d.trim().match(/^(\d{1,2})\s*\/\s*(\d{4}-\d{2})$/);
            return m ? `${m[2]}-${m[1].padStart(2, '0')}` : d;
        },
    },
});
