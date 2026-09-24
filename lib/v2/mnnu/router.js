module.exports = function (router) {
    router.get('/yjsy/:type', require('./yjsy'));
    router.get('/yjsc/:type', require('./yjsc'));
};
