module.exports = function (router) {
    router.get('/adge/:type', require('./adge'));
    router.get('/smpe/:type', require('./smpe'));
};
