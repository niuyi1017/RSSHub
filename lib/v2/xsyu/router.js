module.exports = function (router) {
    router.get('/yjszs/:type', require('./yjszs'));
    router.get('/yjszs-index', require('./yjszs-index'));
};
