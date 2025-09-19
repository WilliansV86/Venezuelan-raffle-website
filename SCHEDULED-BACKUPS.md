# Setting Up Scheduled Database Backups

This guide explains how to set up automated, scheduled backups for your Venezuelan Raffle Website database.

## Prerequisites

- MongoDB Database Tools installed (specifically `mongodump`)
- Access to task scheduling on your server

## Installation Instructions

### 1. Install MongoDB Database Tools

**Windows:**
1. Download MongoDB Database Tools from the [official MongoDB website](https://www.mongodb.com/try/download/database-tools)
2. Run the installer and follow the instructions
3. Ensure the tools are added to your PATH environment variable

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install mongodb-database-tools
```

**Linux (RHEL/CentOS):**
```bash
sudo yum install mongodb-database-tools
```

### 2. Verify Installation

Open a command prompt or terminal and run:
```
mongodump --version
```

You should see the version information displayed.

## Setting Up Scheduled Backups

### Windows (Task Scheduler)

1. Open Task Scheduler (search for it in the Start menu)
2. Click "Create Basic Task" in the right panel
3. Enter a name like "Venezuelan Raffle Database Backup" and click Next
4. Select when you want the backup to run (e.g., Daily) and click Next
5. Set the start time and recurrence pattern, then click Next
6. Select "Start a program" and click Next
7. Browse to the location of your `backup-database.bat` script
8. Set the working directory to your project folder
9. Click Next and then Finish

### Linux (Cron Job)

1. Open your crontab file for editing:
```bash
crontab -e
```

2. Add a line to schedule the backup script. For example, to run it daily at 2 AM:
```
0 2 * * * cd /path/to/your/project && node backend/src/utils/databaseBackup.js >> /path/to/backup.log 2>&1
```

3. Save and exit the editor

## Backup Storage Management

The backup script is configured to:
- Store backups in the `backend/backups` directory
- Keep the 5 most recent backups
- Automatically delete older backups

## Manual Backup

To run a manual backup at any time:

1. Open a command prompt or terminal
2. Navigate to your project directory
3. Run the backup script:
   ```
   backup-database.bat
   ```

## Restoring From a Backup

To restore your database from a backup:

1. Locate the backup folder in `backend/backups`
2. Use the `mongorestore` command:

```bash
mongorestore --uri="your_mongodb_uri" path/to/backup/folder
```

## Important MongoDB Atlas Whitelist Reminder

**CRITICAL**: For backups to work properly with MongoDB Atlas, ensure that your server's IP address is added to the MongoDB Atlas IP whitelist in Network Access settings. This is essential for both the application and backup processes.

To add your IP to the whitelist:

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Select your project
3. Go to Network Access under Security
4. Click "Add IP Address"
5. Add your server's public IP address
6. Click "Confirm"

With your current MongoDB URI: `mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true&w=majority`

## Troubleshooting

### Common Issues

1. **Error connecting to MongoDB**
   - Verify your MongoDB URI is correct in your .env file
   - Check that your IP is whitelisted in MongoDB Atlas

2. **mongodump command not found**
   - Ensure MongoDB Database Tools are installed
   - Verify the installation path is in your system's PATH variable

3. **Permission denied errors**
   - Check that your application has write permissions to the backups directory
   - On Linux, ensure the cron job runs as a user with appropriate permissions
