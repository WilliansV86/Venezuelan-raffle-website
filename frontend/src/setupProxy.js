// Proxy configuration to connect to backend server 
const { createProxyMiddleware } = require('http-proxy-middleware'); 
 
module.exports = function(app) { 
  app.use( 
    '/api', 
    createProxyMiddleware({ 
      target: 'http://127.0.0.1:5100', 
      changeOrigin: true, 
      // Add additional options for better debugging
      logLevel: 'debug',
      onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(504).send({
          success: false,
          message: 'Error connecting to backend server',
          error: err.message
        });
      },
      // Increase timeout to handle slow connections
      timeout: 60000 // 60 seconds
    }) 
  ); 
}; 
