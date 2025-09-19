@echo off
echo ===================================================
echo FIX HARDCODED URLS AND DEPLOY FRONTEND
echo ===================================================
echo.

cd %~dp0
echo Working directory: %CD%

echo 1. Running the localhost URL fix script...
node fix-all-localhost-urls.js

echo.
echo 2. Building the frontend...
cd frontend
call npm run build

echo.
echo 3. Creating a new branch for the fixes...
cd ..
git checkout -b fix-hardcoded-urls

echo.
echo 4. Committing changes...
git add frontend/src/
git commit -m "Fix all hardcoded localhost URLs to use central API configuration"

echo.
echo 5. Pushing to GitHub...
git push -u origin fix-hardcoded-urls

echo.
echo ===================================================
echo DEPLOYMENT INSTRUCTIONS:
echo ===================================================
echo 1. Go to your Netlify dashboard
echo 2. Navigate to Site settings -> Build & deploy -> Branches
echo 3. Update your Production branch to "fix-hardcoded-urls"
echo 4. Trigger a new deploy
echo.
echo Done! Your site should now use the centralized API configuration.
echo ===================================================

pause
