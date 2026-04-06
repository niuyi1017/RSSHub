module.exports = function (router) {
  router.get('/yjszs/:type', require('./yjszs'));
  router.get('/cl/:type', require('./cl'));
};
