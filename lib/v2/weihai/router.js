module.exports = function (router) {
  router.get('/gov/:type', require('./gov'));
};
