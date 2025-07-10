# Venezuelan Raffle Website - Production Documentation

## Introduction

This is the central documentation hub for the Venezuelan Raffle Website production deployment. This document links to all relevant production configuration files, guides, and utilities.

## Deployment & Configuration

### Setup Guides

- [Complete Production Setup Guide](README-PRODUCTION.md) - Step-by-step production deployment instructions
- [HTTPS Setup Guide](HTTPS-SETUP.md) - Instructions for configuring secure HTTPS
- [Production Checklist](PRODUCTION-CHECKLIST.md) - Complete pre/post-deployment checklist
- [Scheduled Backups Guide](SCHEDULED-BACKUPS.md) - How to set up automatic database backups

### Scripts & Utilities

| Script | Description |
|--------|-------------|
| `deploy-production.bat` | Builds frontend and prepares backend for production |
| `start-production-server.bat` | Runs the backend server in production mode |
| `check-production-readiness.bat` | Tests all connections (MongoDB, Cloudinary, Email) |
| `test-mongodb-connection.bat` | Tests MongoDB connection and IP whitelist |
| `test-cloudinary-connection.bat` | Tests Cloudinary API integration |
| `test-email-connection.bat` | Tests email sending functionality |
| `backup-database.bat` | Creates a database backup manually |
| `install-production-dependencies.bat` | Installs production dependencies |

## Environment Configuration

### Required Environment Variables

- **Database**: `MONGO_URI`
- **Server**: `PORT`, `NODE_ENV`
- **Email**: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_FROM`, `EMAIL_FROM_NAME`, `ADMIN_EMAIL`
- **Cloudinary**: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- **Admin**: `ADMIN_KEY`

## Monitoring & Maintenance

### Admin Monitoring Endpoints

| Endpoint | Description | Access |
|----------|-------------|--------|
| `/api/health/ping` | Basic uptime check | Public |
| `/api/health` | Detailed health check | Public |
| `/api/admin/monitor/system` | System metrics | Admin |
| `/api/admin/monitor/database` | Database stats | Admin |
| `/api/admin/monitor/logs` | Recent application logs | Admin |
| `/api/admin/monitor/test-email` | Send test email | Admin |

### Logs

Production logs are stored in the `backend/logs/` directory:
- `application-YYYY-MM-DD.log` - All application logs
- `errors-YYYY-MM-DD.log` - Error logs only

Logs are automatically rotated daily and kept for 14 days (application logs) or 30 days (error logs).

### Backups

Database backups are stored in the `backend/backups/` directory. By default, the 5 most recent backups are kept.

## Security

### Production Security Features

- **Rate Limiting**: Protects against API abuse (100 requests per 15 minutes per IP)
- **HTTPS**: Use the HTTPS guide to secure communication
- **Admin Authentication**: Protected endpoints require admin key
- **File Validation**: Strict file validation for payment proof uploads
- **Structured Logging**: Detailed logs for audit and troubleshooting

## Troubleshooting

### Common Issues

1. **MongoDB Connection Fails**
   - Add your server IP to MongoDB Atlas IP whitelist
   - Verify correct MongoDB URI in `.env` file

2. **Email Sending Fails**
   - Check email credentials in `.env` file
   - If using Gmail, set up App Password

3. **File Upload Issues**
   - Verify Cloudinary credentials in `.env` file
   - Check for proper file types and sizes

## Contact & Support

For additional assistance, contact the development team or refer to the README-PRODUCTION.md file.
