module.exports = function (router) {
  router.get('/jnhrss/:type', require('./jnhrss'));
};
