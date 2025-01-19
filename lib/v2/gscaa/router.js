module.exports = function (router) {
    router.get('/list/:type', require('./list'));
};
