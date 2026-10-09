module.exports = {
    'yangtzeu.edu.cn': {
        _name: '长江大学',
        gs: [
            {
                title: '研究生院',
                docs: 'https://docs.rsshub.app/university.html#chang-jiang-da-xue',
                source: ['/zsgz/:type.htm'],
                target: (params) => `/yangtzeu/gs/zsgz-${params.type}`,
            },
        ],
    },
};
