module.exports = function (router) {
    router.get('/job/:type?', require('./index'));
    router.get('/admission/:type', require('./admission'));
};
