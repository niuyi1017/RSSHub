module.exports = function (router) {
    router.get('/master/:type', require('./master/masterinfo'));
    router.get('/gs/:type', require('./gs'));
};
