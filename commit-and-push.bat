@echo off
echo Adding batch file...
git add commit-and-push.bat

echo Committing changes...
git commit -m "Remove sensitive file and add deployment script"
if %errorlevel% neq 0 (
  echo Error committing changes
  pause
  exit /b 1
)

echo Pushing changes...
git push --set-upstream origin fix-hardcoded-urls --force
if %errorlevel% neq 0 (
  echo Error pushing changes
  pause
  exit /b 1
)

echo Changes pushed successfully!
pause
