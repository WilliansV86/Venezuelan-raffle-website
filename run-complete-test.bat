@echo off
echo Starting Complete Production Test with Enhanced Settings...

:: Server Settings
SET NODE_ENV=production
SET PORT=5001

:: MongoDB with enhanced connection options
SET MONGO_URI=mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true^&w=majority^&connectTimeoutMS=30000^&socketTimeoutMS=45000^&maxPoolSize=10^&family=4

:: Admin Authentication
SET ADMIN_KEY=test-admin-key-123

:: Email Configuration (placeholder values for testing)
SET EMAIL_HOST=smtp.gmail.com
SET EMAIL_PORT=587
SET EMAIL_SECURE=false
SET EMAIL_USER=test@example.com
SET EMAIL_PASSWORD=test-password
SET EMAIL_FROM=test@example.com
SET EMAIL_FROM_NAME=Sorteo Venezolano Test
SET ADMIN_EMAIL=admin@example.com

:: Cloudinary Configuration (placeholder values for testing)
SET CLOUDINARY_CLOUD_NAME=test-cloud
SET CLOUDINARY_API_KEY=test-key
SET CLOUDINARY_API_SECRET=test-secret

echo All environment variables set!
echo Starting server with enhanced MongoDB connection...

cd backend
node server.js

pause
