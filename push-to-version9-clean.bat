@echo off
echo ===================================================
echo PUSHING VENEZUELAN RAFFLE WEBSITE TO GITHUB AS VERSION9-CLEAN
echo ===================================================
echo.

cd %~dp0

echo 1. Making sure git is initialized...
if not exist .git (
  git init
  echo Git repository initialized.
)

echo 2. Adding all files to git...
git add .

echo 3. Creating commit for version9-clean...
git commit -m "Saving work as version9-clean with improved email template and hidden ticket numbers"

echo 4. Creating version9-clean branch...
git checkout -b version9-clean

echo 5. Checking if remote exists...
git remote -v | findstr "origin" > nul
if %errorlevel% neq 0 (
  echo No remote found. Please enter your GitHub repository URL:
  set /p repo_url="GitHub URL (e.g., https://github.com/username/repo.git): "
  git remote add origin !repo_url!
) else (
  echo Remote origin already exists.
)

echo 6. Pushing to GitHub...
git push -u origin version9-clean

echo.
echo ===================================================
echo If push was successful, the version9-clean branch is now on GitHub.
echo This version includes the improved email template and hidden ticket numbers.
echo ===================================================
pause
