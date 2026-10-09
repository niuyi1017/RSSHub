module.exports = {
    'cmu.edu.cn': {
        _name: '中国医科大学',
        www: [
            {
                title: '研究生院',
                docs: 'https://docs.rsshub.app/university.html#zhong-guo-yi-ke-da-xue',
                source: ['/cmuyjs/zsxx/:type.htm'],
                target: (params) => `/cmu/cmuyjs/zsxx-${params.type}`,
            },
        ],
    },
};
