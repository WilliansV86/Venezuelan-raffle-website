@echo off
echo ===================================================
echo Watching Backend Logs for Email Activity
echo ===================================================
echo.
cd backend
echo Press Ctrl+C to stop watching logs
type nul > temp-email-log.txt
node -e "const fs=require('fs');process.stdin.on('data',data=>{const line=data.toString();if(line.includes('email') || line.includes('Brevo') || line.includes('Email') || line.includes('mail')){fs.appendFileSync('temp-email-log.txt',line);console.log('\033[92m'+line+'\033[0m')}else{console.log(line)}})"
pause
