// Proxy setup removed - API base path is now http://localhost:3000
// If you need to proxy API requests in the future, uncomment and configure below:

// const { createProxyMiddleware } = require('http-proxy-middleware');
//
// module.exports = function(app) {
//   const proxyTarget = process.env.REACT_APP_PROXY_TARGET || 'http://localhost:3001';
//   
//   app.use(
//     '/api',
//     createProxyMiddleware({
//       target: proxyTarget,
//       changeOrigin: true,
//       secure: false,
//     })
//   );
// };
