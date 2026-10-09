module.exports = {
    'gzmu.edu.cn': {
        _name: '贵州民族大学',
        yjsy: [
            {
                title: '研究生院',
                docs: 'https://docs.rsshub.app/university.html#gui-zhou-min-zu-da-xue',
                source: ['/zsgz/:type'],
                target: (params) => `/gzmu/yjsy/zsgz-${params.type}`,
            },
        ],
    },
};
