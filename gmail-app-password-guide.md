# Gmail App Password Generation Guide

To use Gmail as your email provider, you'll need to create an App Password instead of using your regular Gmail password. This is a security requirement from Google for applications that don't support Google's modern authentication methods.

## Step-by-Step Instructions

### 1. Enable 2-Step Verification

1. Go to your Google Account: https://myaccount.google.com/
2. Select "Security" from the left navigation panel
3. Under "Signing in to Google," select "2-Step Verification"
4. Follow the prompts to turn on 2-Step Verification
5. Complete the verification process

### 2. Generate an App Password

1. After enabling 2-Step Verification, return to the Security page
2. Under "Signing in to Google," select "App passwords"
   - If you don't see this option, it means:
     - 2-Step Verification is not set up for your account
     - 2-Step Verification is set up but with security keys only
     - Your account is through work, school, or other organization
     - Advanced Protection is turned on for your account
3. At the bottom, click "Select app" and choose "Mail" or "Other (Custom name)"
4. If you choose "Other", enter "Venezuelan Raffle Website"
5. Click "Generate"
6. Google will display a 16-character password (with spaces)
7. Copy this password - you will use it in your application
8. Click "Done"

### 3. Configure Your Application

1. Open your project's `.env` file
2. Add these two lines:
```
GMAIL_USER=your_gmail_address@gmail.com
GMAIL_PASS=your_16_character_app_password
```
3. Remove any spaces from the 16-character password when adding it to your .env file

### 4. Update Code to Use Gmail

Once you've set up the Gmail app password, you'll need to update your code to use Gmail instead of SendGrid:

1. Make sure the `gmailService.js` file exists (we created this earlier)
2. Update the transaction controller to use Gmail by changing:

```javascript
// Find this line:
const { sendEmail } = require('../utils/emailService');

// Change to:
const { sendEmail } = require('../utils/gmailService');
```

### Important Notes

- App passwords are 16 characters long, with no spaces
- Each App Password can only be viewed once, at creation time
- If you lose your App Password, you'll need to generate a new one
- Using Gmail for business purposes may have limitations
- Google has sending limits (around 500 emails per day for regular Gmail accounts)

### Testing Your Gmail Configuration

Run the following test to verify your Gmail setup:

```
cd c:\Users\WParedes\Desktop\Venezuelan-raffle-website\backend
node test-email-gmail.js
```

Make sure to edit the test-email-gmail.js file first to update the Gmail credentials.
