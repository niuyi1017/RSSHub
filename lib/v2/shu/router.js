module.exports = function (router) {
    router.get('/yjszs/:type', require('./yjszs'));
    router.get('/sociology/:type', require('./sociology'));
    router.get('/mat/:type', require('./mat'));
};
