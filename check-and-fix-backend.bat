@echo off
echo Checking and fixing backend configuration...

cd %~dp0backend

echo Verifying .env file exists with correct values...
echo MONGO_URI=mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true^&w=majority > .env.temp
echo PORT=5100 >> .env.temp
echo ADMIN_KEY=test-admin-key-123 >> .env.temp
echo NODE_ENV=development >> .env.temp

move /y .env.temp .env

echo .env file has been configured.
echo.
echo Starting backend server...
start cmd /c "npm start"

echo Backend server started at http://localhost:5100
echo.
pause
