module.exports = function (router) {
    router.get('/yz/:type', require('./yz'));
    router.get('/cnsba/:type', require('./cnsba'));
};
