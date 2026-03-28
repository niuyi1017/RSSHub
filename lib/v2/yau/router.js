module.exports = function (router) {
    router.get('/yjsc/:type', require('./yjsc'));
    router.get('/yjsy/:type', require('./yjsy'));
};
