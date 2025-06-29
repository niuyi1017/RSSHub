module.exports = function (router) {
    router.get('/zsb/:type', require('./zsb'));
    router.get('/sg/:type', require('./sg'));
};
