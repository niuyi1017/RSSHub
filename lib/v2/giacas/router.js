module.exports = function (router) {
    router.get('/index/:type', require('./index'));
};
