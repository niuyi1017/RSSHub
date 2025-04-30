module.exports = function (router) {
    router.get('/ge/:type', require('./ge'));
    router.get('/zhaosheng/:type', require('./zhaosheng'));
};
