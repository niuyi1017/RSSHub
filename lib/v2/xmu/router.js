module.exports = function (router) {
    router.get('/zs/:type', require('./zs'));
    router.get('/med/:type', require('./med'));
};
