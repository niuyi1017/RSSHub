module.exports = {
    'mnnu.edu.cn': {
        _name: '闽南师范大学',
        yjsy: [
            {
                title: '研究生院',
                docs: 'https://docs.rsshub.app/university.html#min-nan-shi-fan-da-xue',
                source: ['/zsgz/:type.htm'],
                target: (params) => `/mnnu/yjsy/zsgz-${params.type}`,
            },
        ],
    },
};
