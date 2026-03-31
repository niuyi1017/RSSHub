module.exports = function (router) {
    router.get('/sfb/:type', require('./sfb'));
    router.get('/yjsc/:type', require('./yjsc'));
};
