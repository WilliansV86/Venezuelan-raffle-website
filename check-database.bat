@echo off
echo Checking MongoDB Database Connection and Data...

cd backend

echo 1. Testing MongoDB Connection...
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI).then(() => { console.log('✅ MongoDB Connection SUCCESS'); mongoose.disconnect(); }).catch(err => { console.error('❌ Connection FAILED:', err.message); })"

echo.
echo 2. Checking Active Raffles...
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI).then(async () => { try { const Raffle = require('./src/models/Raffle'); const activeRaffles = await Raffle.find({ status: 'active' }).lean(); console.log(`Found ${activeRaffles.length} active raffles:`); console.log(JSON.stringify(activeRaffles, null, 2)); } catch (err) { console.error('Error fetching raffles:', err); } finally { mongoose.disconnect(); } }).catch(err => { console.error('Connection failed:', err.message); })"

echo.
echo 3. Checking Admin Configuration...
node -e "require('dotenv').config(); console.log('ADMIN_KEY configured:', process.env.ADMIN_KEY ? '✅ YES' : '❌ NO'); console.log('PORT configured:', process.env.PORT || '5000 (default)');"

echo.
echo Check completed! If you see any errors above, please address them before starting the application.
echo.
