@echo off
echo.
echo =================================================================
echo  Starting Server with Full Configuration
echo =================================================================
echo.
echo Setting environment variables...

set MONGO_URI=mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true&w=majority
set PORT=5100
set ADMIN_KEY=Tusuerte2025
set NODE_ENV=development
set JWT_SECRET=tusuerteestaaquive#2025rifas_
set CLOUDINARY_CLOUD_NAME=dnxelz82j
set CLOUDINARY_API_KEY=965986245558393
set CLOUDINARY_API_SECRET=dw3uLgrY7iFr9YcaXk8eK_ad8mw

echo All variables set. Starting the server...
echo.

npm start
