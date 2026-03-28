module.exports = (router) => {
    router.get('/master/:type', require('./master'));
    router.get('/yjszs/:type', require('./yjszs'));
};
