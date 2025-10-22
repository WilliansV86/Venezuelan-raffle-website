require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const { uploadToCloudinary } = require('./cloudinaryConfig');
const path = require('path');
const fs = require('fs');

/**
 * Migrates existing transaction payment screenshots to Cloudinary
 * This script will:
 * 1. Find all transactions with local file paths
 * 2. Upload those files to Cloudinary
 * 3. Update the transaction records with Cloudinary URLs
 */

async function migrateImagesToCloudinary() {
  try {
    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      console.error('MongoDB connection string is missing');
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all transactions with payment screenshots
    const transactions = await Transaction.find({
      paymentScreenshot: { $exists: true, $ne: null }
    });

    console.log(`Found ${transactions.length} transactions with payment screenshots`);

    // Process each transaction
    let successCount = 0;
    let errorCount = 0;

    for (const transaction of transactions) {
      try {
        // Skip if already a Cloudinary URL
        if (transaction.paymentScreenshot.startsWith('http')) {
          console.log(`Transaction ${transaction._id}: Already using a URL, skipping`);
          continue;
        }

        // Construct full file path
        const filePath = path.join(process.cwd(), transaction.paymentScreenshot);
        
        // Check if the file exists
        if (!fs.existsSync(filePath)) {
          console.log(`Transaction ${transaction._id}: File does not exist at ${filePath}, skipping`);
          errorCount++;
          continue;
        }

        console.log(`Processing transaction ${transaction._id}, file: ${filePath}`);

        // Upload to Cloudinary
        const result = await uploadToCloudinary(filePath, {
          folder: 'payment_screenshots',
          public_id: `transaction_${transaction._id}`
        });

        // Update transaction record
        transaction.paymentScreenshot = result.secure_url;
        await transaction.save();

        console.log(`✅ Transaction ${transaction._id}: Successfully migrated to ${result.secure_url}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error processing transaction ${transaction._id}:`, error);
        errorCount++;
      }
    }

    console.log('\n==== Migration Summary ====');
    console.log(`Total transactions: ${transactions.length}`);
    console.log(`Successfully migrated: ${successCount}`);
    console.log(`Errors: ${errorCount}`);

    console.log('\nMigration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the migration
migrateImagesToCloudinary();
