module.exports = function (router) {
    router.get('/zsks/:type', require('./zsks'));
};
