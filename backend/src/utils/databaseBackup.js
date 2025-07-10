/**
 * MongoDB Database Backup Utility
 * 
 * Creates a backup of the MongoDB database and saves it to a backup directory
 * Can be scheduled to run automatically using a cron job
 */

require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

// Create backup directory if it doesn't exist
const backupDir = path.join(__dirname, '../../backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

/**
 * Run MongoDB database backup using mongodump
 * Requires mongodump to be installed on the system
 */
async function createDatabaseBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `backup-${timestamp}`);
  
  // Extract database name from MONGO_URI
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    logger.error('Database backup failed: MONGO_URI not set in environment variables');
    return { success: false, error: 'MONGO_URI not set' };
  }
  
  try {
    // Extract parts from MongoDB URI
    const uriPattern = /mongodb\+srv:\/\/([^:]+):([^@]+)@([^\/]+)\/([^?]+)/;
    const matches = mongoUri.match(uriPattern);
    
    if (!matches || matches.length < 5) {
      throw new Error('Invalid MongoDB URI format');
    }
    
    const [, username, password, host, dbName] = matches;
    
    logger.info(`Starting database backup for ${dbName} to ${backupPath}`);
    
    // Create the backup using mongodump
    // Note: mongodump needs to be installed on the system
    return new Promise((resolve, reject) => {
      // For MongoDB Atlas, we use mongodump with URI
      const cmd = 'mongodump';
      const args = [
        `--uri="${mongoUri}"`,
        `--out=${backupPath}`
      ];
      
      const mongodump = spawn(cmd, args, { shell: true });
      
      let stdoutData = '';
      let stderrData = '';
      
      mongodump.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });
      
      mongodump.stderr.on('data', (data) => {
        stderrData += data.toString();
      });
      
      mongodump.on('close', (code) => {
        if (code === 0) {
          logger.info(`Database backup completed successfully to ${backupPath}`);
          resolve({ 
            success: true, 
            backupPath, 
            timestamp, 
            database: dbName 
          });
        } else {
          logger.error(`Database backup failed with code ${code}: ${stderrData}`);
          reject(new Error(`Backup failed with code ${code}: ${stderrData}`));
        }
      });
    });
    
  } catch (error) {
    logger.error('Database backup failed', { error: error.message });
    return { success: false, error: error.message };
  }
}

/**
 * Clean up old backups, keeping only the most recent ones
 * @param {number} keepCount Number of recent backups to keep
 */
async function cleanupOldBackups(keepCount = 5) {
  try {
    const files = fs.readdirSync(backupDir);
    const backups = files
      .filter(file => file.startsWith('backup-'))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        time: fs.statSync(path.join(backupDir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time); // Sort by time, newest first
    
    // Keep the most recent backups and delete the rest
    if (backups.length > keepCount) {
      const toDelete = backups.slice(keepCount);
      
      logger.info(`Cleaning up ${toDelete.length} old backups, keeping ${keepCount} most recent`);
      
      toDelete.forEach(backup => {
        try {
          // Use rimraf or similar for directory deletion if available
          if (fs.existsSync(backup.path)) {
            fs.rmSync(backup.path, { recursive: true, force: true });
            logger.info(`Deleted old backup: ${backup.name}`);
          }
        } catch (err) {
          logger.error(`Failed to delete backup ${backup.name}`, { error: err.message });
        }
      });
      
      return { success: true, deletedCount: toDelete.length };
    } else {
      logger.info(`No old backups to clean up. Current count: ${backups.length}, keeping: ${keepCount}`);
      return { success: true, deletedCount: 0 };
    }
  } catch (error) {
    logger.error('Backup cleanup failed', { error: error.message });
    return { success: false, error: error.message };
  }
}

// Run backup if script is called directly
if (require.main === module) {
  createDatabaseBackup()
    .then(result => {
      if (result.success) {
        return cleanupOldBackups(5); // Keep 5 most recent backups
      }
    })
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('Backup process failed:', error);
      process.exit(1);
    });
}

module.exports = {
  createDatabaseBackup,
  cleanupOldBackups
};
