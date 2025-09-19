# Email Provider Alternatives for Venezuelan Raffle Website

## Current Issue
Your SendGrid free trial expired on September 2nd, 2025, which is why email notifications aren't working.

## Solution Options

### Option 1: Purchase a SendGrid Plan
- Continue using the existing code
- Purchase a paid SendGrid plan (starting at $19.95/month)
- Update the existing API key in your .env file

### Option 2: Use Gmail (Recommended for simplicity)
We've already implemented a Gmail-based solution. To use it:

1. Edit your `.env` file to add:
```
GMAIL_USER=your_gmail_address@gmail.com
GMAIL_PASS=your_app_password
```

2. For the Gmail password, you need to:
   - Enable 2-Factor Authentication in your Google account
   - Create an "App Password" from Google Account settings
   - Use this App Password instead of your regular Gmail password

3. Update the transaction controller to use Gmail:

```javascript
// In transactionController.js
// Find the line that imports emailService
const { sendEmail } = require('../utils/emailService');

// Change to:
const { sendEmail } = require('../utils/gmailService');
```

### Option 3: Use Another Email Provider

#### Mailgun:
- Free tier: 5,000 emails for 3 months
- Install package: `npm install mailgun-js`
- Update .env:
```
MAILGUN_API_KEY=your_api_key
MAILGUN_DOMAIN=your_domain
```

#### Amazon SES:
- Pay as you go, very affordable
- Install package: `npm install aws-sdk`
- Update .env:
```
AWS_ACCESS_KEY=your_key
AWS_SECRET_KEY=your_secret
AWS_REGION=your_region
```

## Testing Your New Configuration

Run this command to test your email configuration:
```
.\test-email-config.bat
```

This will check your environment variables and attempt to send a test email.
