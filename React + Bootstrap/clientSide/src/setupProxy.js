const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // Add your proxy rule for the OpenChargeMap API here
  app.use(
    '/v3/poi',
    createProxyMiddleware({
      target: 'https://api.openchargemap.io',
      changeOrigin: true,
    })
  );
};
