module.exports = function (router) {
    router.get('/grasch/:type', require('./grasch'));
    router.get('/zsgz/:type', require('./zsgz'));
};
