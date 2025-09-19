@echo off
echo ===================================================
echo PUSHING VENEZUELAN RAFFLE WEBSITE TO GITHUB AS VERSION10
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

echo 3. Creating commit for version10...
git commit -m "Saving work as version10 before starting over"

echo 4. Checking if remote exists...
git remote -v | findstr "origin" > nul
if %errorlevel% neq 0 (
  echo No remote found. Please enter your GitHub repository URL:
  set /p repo_url="GitHub URL (e.g., https://github.com/username/repo.git): "
  git remote add origin !repo_url!
) else (
  echo Remote origin already exists.
)

echo 5. Pushing to GitHub...
git push -u origin master

echo.
echo ===================================================
echo If push was successful, you can now pull a different version
echo and start over with your project.
echo ===================================================
pause
