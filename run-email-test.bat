@echo on
echo ===================================================
echo Testing Email Functionality with SendGrid
echo ===================================================
echo.
cd backend
echo Running test script with all output redirected to email-test-output.txt
node email-test-simple.js > email-test-output.txt 2>&1
echo Test completed. Results saved to email-test-output.txt
echo Displaying results:
type email-test-output.txt
pause
