module.exports = function (router) {
    router.get('/gszs/:type', require('./gszs'));
    router.get('/life/:type', require('./life'));
};
