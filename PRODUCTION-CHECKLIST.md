# Venezuelan Raffle Website - Production Deployment Checklist

This checklist ensures your Venezuelan Raffle Website is properly configured for production use.

## Pre-Deployment Checklist

### Database Configuration
- [ ] MongoDB Atlas IP whitelist configured with production server IP
  - **CRITICAL**: Add your server's IP to MongoDB Atlas Network Access
  - MongoDB URI: `mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true&w=majority`
- [ ] Run `test-mongodb-connection.bat` to verify connectivity

### Environment Variables
- [ ] Copy `.env.production` to `.env` in backend directory
- [ ] Update all credentials with real production values:
  - [ ] MongoDB URI (already set)
  - [ ] Admin key (secure value)
  - [ ] Email service credentials
  - [ ] Cloudinary API credentials
- [ ] Set `NODE_ENV=production` in environment or .env file

### Email Configuration
- [ ] Email service credentials added to .env file
- [ ] If using Gmail, App Password generated and configured
- [ ] Run `test-email-connection.bat` to verify sending works
- [ ] Admin email notification address is valid

### File Upload Configuration
- [ ] Cloudinary account created and configured
- [ ] Cloudinary API credentials added to .env file
- [ ] Run `test-cloudinary-connection.bat` to verify uploads work

### Frontend Configuration
- [ ] Testing modes disabled (`TESTING_MODE` and `PURE_TESTING_MODE` in RaffleDetailPage.js)
- [ ] All API endpoints point to production URLs
- [ ] Frontend built with `npm run build` in frontend directory

## Deployment Steps

### Option 1: Automated Deployment
1. [ ] Run `check-production-readiness.bat` to verify all services
2. [ ] Run `deploy-production.bat` to build and prepare files
3. [ ] Deploy backend files to your hosting provider
4. [ ] Deploy frontend build files to static hosting

### Option 2: Single-Server Deployment
1. [ ] Run `check-production-readiness.bat` to verify all services
2. [ ] Run `deploy-production.bat` to build and prepare files
3. [ ] Copy frontend/build folder to backend/public
4. [ ] Deploy the entire backend folder to your server

## Post-Deployment Tests

### Security
- [ ] All communication uses HTTPS (see HTTPS-SETUP.md)
- [ ] Rate limiting is enabled (already configured in code)
- [ ] Admin routes are protected by API key

### Functionality
- [ ] Health check endpoint returns 200 (`/api/health/ping`)
- [ ] Raffles list loads correctly
- [ ] Ticket purchase flow works end-to-end
- [ ] Payment proofs upload successfully
- [ ] Confirmation emails are received
- [ ] Admin notifications are received

### Performance
- [ ] Website loads in under 3 seconds
- [ ] Images are properly compressed
- [ ] API responses are fast (< 500ms)

## Monitoring & Maintenance

### Monitoring
- [ ] Set up uptime monitoring (e.g. UptimeRobot, Pingdom)
- [ ] Configure alerts for server downtime
- [ ] Check logs regularly at `/backend/logs`

### Maintenance
- [ ] Schedule regular database backups
- [ ] Plan for SSL certificate renewal (if self-managed)
- [ ] Document the process for deploying updates

## Troubleshooting Common Issues

### Database Connection Fails
- Check MongoDB Atlas IP whitelist (most common issue)
- Verify MongoDB URI is correct in .env file
- Ensure MongoDB Atlas cluster is running

### Email Sending Fails
- Check email credentials in .env file
- If using Gmail, verify App Password is correct
- Check if your email provider blocks automated emails

### File Uploads Fail
- Verify Cloudinary credentials in .env file
- Check upload limit settings in Cloudinary dashboard
- Ensure files meet size and type requirements

### Frontend Cannot Connect to Backend
- Check CORS settings in server.js
- Verify API URLs in frontend code
- Ensure backend server is running and accessible

## Support

For additional assistance, contact the development team or review the README-PRODUCTION.md file.
