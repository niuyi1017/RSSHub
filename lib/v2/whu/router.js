module.exports = function (router) {
    router.get('/wdyz/:type', require('./wdyz'));
    router.get('/gs/:type', require('./gs'));
};
