module.exports = function (router) {
    router.get('/yz/:type', require('./yz'));
    router.get('/cdibb/:type', require('./cdibb'));
};
