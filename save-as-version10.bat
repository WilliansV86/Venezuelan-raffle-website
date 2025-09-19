@echo off
echo ===================================================
echo SAVING CURRENT STATE AS VERSION10 BRANCH
echo ===================================================
echo.

cd %~dp0

echo 1. Creating new branch version10...
git checkout -b version10

echo 2. Adding all files to git (including untracked)...
git add -A .

echo 3. Committing changes as version10...
git commit -m "Saving all changes as version10 before starting over"

echo 4. Pushing the version10 branch to GitHub...
git push -u origin version10

echo.
echo ===================================================
echo If successful, you can now:
echo 1. Return to your original branch: git checkout Version3
echo 2. Pull a clean version: git pull origin Version3 --force
echo 3. Or checkout any other branch to start fresh
echo ===================================================
pause
