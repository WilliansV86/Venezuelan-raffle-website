# Setting Up HTTPS for Venezuelan Raffle Website

This guide provides instructions for configuring secure HTTPS connections for your Venezuelan Raffle Website in production.

## Why HTTPS is Important

- **Security**: Protects user data during transmission
- **Trust**: Shows visitors your site is legitimate
- **Browser Compatibility**: Modern browsers mark HTTP sites as "Not Secure"
- **SEO**: HTTPS is a ranking factor for search engines

## Option 1: Using a Reverse Proxy (Recommended)

The most common approach is to use a reverse proxy like Nginx or Apache to handle HTTPS, while your Node.js application runs on an internal port.

### Nginx Configuration

1. Install Nginx on your server:
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. Get SSL certificates using Let's Encrypt and Certbot:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d sorteovenezolano.com -d www.sorteovenezolano.com
   ```

3. Create an Nginx configuration file (`/etc/nginx/sites-available/sorteovenezolano`):
   ```nginx
   server {
       listen 80;
       server_name sorteovenezolano.com www.sorteovenezolano.com;
       return 301 https://$host$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name sorteovenezolano.com www.sorteovenezolano.com;

       ssl_certificate /etc/letsencrypt/live/sorteovenezolano.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/sorteovenezolano.com/privkey.pem;

       # SSL configuration
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_prefer_server_ciphers on;
       ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
       ssl_session_cache shared:SSL:10m;
       ssl_session_timeout 10m;

       # Security headers
       add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
       add_header X-Content-Type-Options nosniff;
       add_header X-Frame-Options SAMEORIGIN;
       add_header X-XSS-Protection "1; mode=block";

       # Proxy to your Node.js application
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. Enable the site and restart Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/sorteovenezolano /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## Option 2: Using a Node.js HTTPS Server

If you're not using a reverse proxy, you can configure HTTPS directly in your Node.js application.

1. Create a `ssl` directory in your backend folder:
   ```bash
   mkdir -p backend/ssl
   ```

2. Generate self-signed certificates (for testing only) or place your real certificates in this directory.

3. Update your `server.js` file to use HTTPS:

```javascript
const https = require('https');
const fs = require('fs');
const path = require('path');

// Your existing Express app setup...

if (process.env.NODE_ENV === 'production') {
  try {
    // Load SSL certificates
    const privateKey = fs.readFileSync(path.join(__dirname, 'ssl', 'privkey.pem'), 'utf8');
    const certificate = fs.readFileSync(path.join(__dirname, 'ssl', 'fullchain.pem'), 'utf8');
    const credentials = { key: privateKey, cert: certificate };
    
    // Create HTTPS server
    const httpsServer = https.createServer(credentials, app);
    
    // Start HTTPS server
    httpsServer.listen(443, () => {
      console.log('HTTPS Server running on port 443');
    });
    
    // Redirect HTTP to HTTPS
    const http = require('http');
    http.createServer((req, res) => {
      res.writeHead(301, { 'Location': 'https://' + req.headers['host'] + req.url });
      res.end();
    }).listen(80);
  } catch (error) {
    console.error('Failed to start HTTPS server:', error);
    console.log('Falling back to HTTP server...');
    startHttpServer();
  }
} else {
  // Development mode - just use HTTP
  startHttpServer();
}

function startHttpServer() {
  app.listen(PORT, () => {
    console.log(`HTTP Server running on port ${PORT}`);
  });
}
```

## Option 3: Using a Cloud Platform

Many cloud platforms provide built-in HTTPS support:

### Heroku

Heroku automatically provides HTTPS for all applications on their `*.herokuapp.com` domains.

For custom domains:
1. Add your custom domain in the Heroku dashboard
2. Configure Automatic Certificate Management (ACM)

### Railway

Railway provides HTTPS by default for all applications.

### Netlify + Backend API

1. Deploy the frontend to Netlify for automatic HTTPS
2. Deploy the backend API separately and configure CORS

## Testing Your HTTPS Configuration

After setting up HTTPS, verify your configuration with these tools:

1. [SSL Labs Server Test](https://www.ssllabs.com/ssltest/)
2. [Security Headers](https://securityheaders.com/)

## Common Issues

- **Certificate Renewal**: Let's Encrypt certificates expire after 90 days. Set up auto-renewal.
- **Mixed Content**: Ensure all resources (images, scripts) use HTTPS.
- **CORS Issues**: Update CORS configuration if using separate frontend and backend domains.

## Next Steps

1. Update your backend CORS configuration to only allow HTTPS origins
2. Update any hardcoded URLs in your frontend code to use HTTPS
3. Consider implementing Content Security Policy (CSP) headers for additional security
