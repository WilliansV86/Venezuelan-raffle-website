@echo off
echo Venezuelan Raffle Website - MongoDB Connection Test
echo ===========================================
echo.

echo Running direct MongoDB connection test...
echo This will verify if your MongoDB connection works and if your IP is whitelisted
echo.

cd backend
node src/utils/testMongoConnection.js

echo.
echo If you see errors about IP address not being allowed, you need to:
echo 1. Log in to MongoDB Atlas at https://cloud.mongodb.com
echo 2. Go to Network Access under Security
echo 3. Click "Add IP Address"
echo 4. Choose "Add Current IP Address" or "Allow Access from Anywhere"
echo 5. Click "Confirm"
echo.

pause
