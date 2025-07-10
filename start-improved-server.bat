@echo off
echo Starting Venezuelan Raffle Website server with improved MongoDB connection...

SET NODE_ENV=production
SET PORT=5001
SET MONGO_URI=mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true^&w=majority^&connectTimeoutMS=30000^&socketTimeoutMS=45000^&maxPoolSize=10

echo Environment variables set!
echo Starting server...

node backend/server.js

pause
