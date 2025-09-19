# Venezuelan Raffle Website - Production Deployment Guide

This guide provides step-by-step instructions for deploying the Venezuelan Raffle Website to production.

## Prerequisites

- Node.js 14.x or higher
- MongoDB Atlas account
- Cloudinary account for image uploads
- Email service account (Gmail, SendGrid, etc.)

## Production Deployment Steps

### 1. Configure MongoDB Atlas

- Log in to your MongoDB Atlas account
- Navigate to Network Access in the security section
- **IMPORTANT:** Add your production server's IP address to the IP whitelist
- If you don't know the exact IP yet, you can temporarily use `0.0.0.0/0` (allows all IPs) but this is not recommended for long-term security

### 2. Configure Environment Variables

- Edit the `.env.production` file in the backend directory with your actual credentials:
  - Use the existing MongoDB URI: `mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true&w=majority`
  - Set a secure `ADMIN_KEY`
  - Configure your email service details
  - Add your Cloudinary credentials

### 3. Build and Deploy

**Option 1: Using the provided script**
1. Run `deploy-production.bat` from the project root directory
2. Follow the on-screen instructions

**Option 2: Manual deployment**
1. Build the frontend: `cd frontend && npm run build`
2. Copy `.env.production` to `.env` in the backend directory
3. Deploy the backend to your server
4. Deploy the frontend build folder to your static hosting service

### 4. Single-Server Deployment (Optional)

If you want to serve both frontend and backend from the same server:

1. Build the frontend
2. Copy the `frontend/build` folder to `backend/public`
3. Add this code to `server.js` before the routes section:

```javascript
// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'public')));

// The "catchall" handler for any request that doesn't match a route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
```

### 5. Verify Deployment

- Test the API endpoint: `https://your-backend-domain.com/api/raffles`
- Test the frontend: Navigate to your production URL
- Test the complete purchase flow
- Verify that emails are being sent properly
- Verify that payment proof uploads are working

### 6. Production Checklist

- [x] Frontend testing modes disabled
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Email service configured and tested
- [ ] Cloudinary configured for image uploads
- [ ] CORS settings updated with production domains
- [ ] SSL/HTTPS enabled for secure connections

## Troubleshooting

### Database Connection Issues

If you see errors like "Could not connect to any servers in your MongoDB Atlas cluster":
1. Verify that your server's IP address is whitelisted in MongoDB Atlas
2. Check that the MongoDB URI in your .env file is correct
3. Ensure your MongoDB user has the correct permissions

### Email Sending Problems

1. If using Gmail, ensure you've created an App Password
2. Check the email logs in your server output
3. Verify that all required email environment variables are set

### Cloudinary Upload Failures

1. Verify your Cloudinary credentials in the .env file
2. Check that your Cloudinary account has sufficient upload credits
3. Look for detailed error messages in the server logs

## Support

For additional help, contact the development team or refer to the project documentation.
