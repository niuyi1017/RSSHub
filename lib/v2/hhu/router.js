module.exports = function (router) {
    router.get('/gs/:type', require('./gs'));
    router.get('/mky/:type', require('./mky'));
};
