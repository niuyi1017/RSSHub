module.exports = (router) => {
    router.get('/yjsy/:category?', require('./yjsy'));
    router.get('/zsgz/:type', require('./zsgz'));
};
