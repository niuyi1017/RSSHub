module.exports = function (router) {
    router.get('/yjs/:type', require('./yjs'));
    router.get('/yzb/734', async (ctx) => {
        ctx.params.type = '7525';
        await require('./yjs')(ctx);
    });
};
