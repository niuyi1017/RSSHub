module.exports = function (router) {
    router.get('/grs', require('./grs'));
    router.get('/gs/:type', require('./gs'));
};
