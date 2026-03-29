module.exports = function (router) {
    router.get('/kmmc/:type', require('./kmmc'));
};
