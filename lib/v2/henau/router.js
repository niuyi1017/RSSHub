module.exports = function (router) {
    router.get('/gra/:type', require('./gra'));
    router.get('/wgyxy/:type', require('./wgyxy'));
};
