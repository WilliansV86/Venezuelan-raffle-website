# Guide to Update Your .env File

You need to manually update your `.env` file with the following information:

## 1. Open your .env file

Navigate to: `backend\.env` and open it in your preferred text editor.

## 2. Update with test values

Replace the placeholder values with the following test values:

```ini
# Server Configuration
NODE_ENV=production
PORT=5000

# MongoDB Configuration
MONGO_URI=mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true&w=majority

# Cloudinary Configuration
# For testing, you can use these demo credentials (they won't actually work for uploads)
CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz12

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=test@gmail.com
EMAIL_PASSWORD=test_password
EMAIL_FROM=test@gmail.com
EMAIL_FROM_NAME=Venezuelan Raffle Test
ADMIN_EMAIL=admin@example.com

# Admin Configuration
ADMIN_KEY=admin123test
```

## 3. For real production use

For actual production use, replace the test values with real credentials:

1. **Cloudinary**: Sign up at cloudinary.com and get your actual credentials
2. **Email**: Use your real email and app password (for Gmail)
3. **Admin Key**: Create a secure random string

## 4. After updating the file

Run the production readiness check again:

```
.\check-production-readiness.bat
```
