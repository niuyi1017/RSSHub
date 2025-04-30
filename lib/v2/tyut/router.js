module.exports = function (router) {
    router.get('/yz/:type', require('./yz'));
    router.get('/gs/:type', require('./gs'));
};
