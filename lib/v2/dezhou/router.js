module.exports = function (router) {
    router.get('/hrss/:type', require('./hrss'));
};
