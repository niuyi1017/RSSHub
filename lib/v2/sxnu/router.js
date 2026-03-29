module.exports = function (router) {
    router.get('/grc/:type', require('./grc'));
};
