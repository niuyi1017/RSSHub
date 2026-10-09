module.exports = {
    'sdutcm.edu.cn': {
        _name: '山东中医药大学',
        yjs: [
            {
                title: '研究生招生信息网',
                docs: 'https://docs.rsshub.app/university.html#shan-dong-zhong-yi-yao-da-xue',
                source: ['/zsgz/sszs/:type.htm'],
                target: (params) => `/sdutcm/yjs/zsgz-sszs-${params.type}`,
            },
        ],
    },
};
