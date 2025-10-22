@echo off
echo ===============================================
echo Venezuelan Raffle Website - Image URL Update Tool
echo ===============================================
echo This tool will update transaction records to use Cloudinary URLs
echo.

echo Checking environment variables...
cd backend
node -e "require('dotenv').config(); if(!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) { console.error('Error: Cloudinary credentials missing in environment variables'); process.exit(1); } else { console.log('Cloudinary credentials found: ' + process.env.CLOUDINARY_CLOUD_NAME); }"

if %errorlevel% neq 0 (
  echo.
  echo ERROR: Cloudinary credentials not configured correctly
  echo Please check your .env file in the backend directory
  echo.
  pause
  exit /b 1
)

echo Starting URL update process...
node src/utils/updateCloudinaryUrls.js

if %errorlevel% neq 0 (
  echo.
  echo Update encountered errors.
  echo Please check the output above for more details.
  echo.
) else (
  echo.
  echo Update completed successfully!
  echo Your transaction records now use Cloudinary URLs.
  echo.
)

pause
