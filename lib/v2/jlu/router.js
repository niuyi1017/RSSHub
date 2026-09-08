module.exports = function (router) {
    router.get('/yzb/:type', require('./yzb'));
    router.get('/zsb/:type', require('./zsb'));
    router.get('/sg/:type', require('./sg'));
};
