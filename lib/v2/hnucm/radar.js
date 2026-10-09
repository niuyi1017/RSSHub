module.exports = {
    'hnucm.edu.cn': {
        _name: '湖南中医药大学',
        yjsy: [
            {
                title: '湖南中医药大学研究生院',
                docs: 'https://docs.rsshub.app/university.html#hu-nan-zhong-yi-yao-da-xue',
                source: ['/zsxx/:type.htm'],
                target: (params) => `/hnucm/yjsy/zsxx-${params.type}`,
            },
        ],
    },
};
