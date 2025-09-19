# Gmail Setup Instructions for Venezuelan Raffle Website

Follow these steps to configure your application to use Gmail for sending emails:

## Step 1: Update Your .env File

Add these two variables to your `.env` file in the backend directory:

```
GMAIL_USER=your_gmail_address@gmail.com
GMAIL_PASS=your_16_character_app_password
```

Replace:
- `your_gmail_address@gmail.com` with your actual Gmail address
- `your_16_character_app_password` with the App Password generated from your Google account (see the App Password guide for detailed instructions)

## Step 2: Get App Password from Google

1. Follow the detailed instructions in `gmail-app-password-guide.md` to:
   - Enable 2-Step Verification on your Google account
   - Generate an App Password specifically for this application

## Step 3: Test Gmail Configuration

Run the test script to verify your Gmail setup is working:

```
.\test-gmail-service.bat
```

This will send a test email to confirm your configuration is working correctly.

## Step 4: Restart Your Backend Server

After updating your `.env` file and verifying the Gmail setup works, restart your backend server:

```
.\run-backend.bat
```

## Step 5: Test Transaction Approval

1. Create a transaction through the website frontend
2. Log in to the admin panel
3. Approve the transaction
4. Check if the confirmation email is sent successfully

## Troubleshooting

If emails still don't send:

1. Check the logs at `backend/logs/email-service.log`
2. Verify your App Password is correct (no spaces)
3. Make sure 2-Step Verification is enabled on your Google account
4. Try creating a new App Password

## Switch Back to SendGrid

If you decide to switch back to SendGrid later (after purchasing a plan), you'll need to:

1. Update the transaction controller to use SendGrid again:
   ```javascript
   // Change from
   const { sendGmailEmail: sendEmail } = require('../utils/gmailService');
   // Back to
   const { sendEmail } = require('../utils/emailService');
   ```

2. Update your `.env` file with the new SendGrid API key
