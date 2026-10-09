module.exports = {
    'hbut.edu.cn': {
        _name: '湖北工业大学',
        yjs: [
            {
                title: '研究生院',
                docs: 'https://docs.rsshub.app/university.html#hu-bei-gong-ye-da-xue',
                source: ['/zsgz/:type.htm'],
                target: (params) => `/hbut/yjs/zsgz-${params.type}`,
            },
            {
                title: '硕士招生',
                docs: 'https://docs.rsshub.app/university.html#hu-bei-gong-ye-da-xue',
                source: ['/zsgz/sszs/:type.htm'],
                target: (params) => `/hbut/yjs/zsgz-sszs-${params.type}`,
            },
        ],
    },
};
