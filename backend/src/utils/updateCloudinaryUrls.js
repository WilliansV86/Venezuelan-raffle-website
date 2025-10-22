require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

/**
 * Updates transaction records to use placeholder Cloudinary URLs when images are missing
 */
async function updateTransactionImageUrls() {
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
    let updateCount = 0;
    let skippedCount = 0;

    for (const transaction of transactions) {
      // Skip if already a proper URL
      if (transaction.paymentScreenshot.startsWith('http')) {
        console.log(`Transaction ${transaction._id}: Already using a URL, skipping`);
        skippedCount++;
        continue;
      }

      // Create a placeholder Cloudinary URL for this transaction
      const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v1/payment_screenshots/placeholder_${transaction._id}.png`;
      
      console.log(`Transaction ${transaction._id}: Updating to use placeholder URL`);
      
      // Update transaction record
      transaction.paymentScreenshot = cloudinaryUrl;
      await transaction.save();
      
      console.log(`✅ Transaction ${transaction._id}: Updated to use placeholder URL`);
      updateCount++;
    }

    console.log('\n==== Update Summary ====');
    console.log(`Total transactions: ${transactions.length}`);
    console.log(`Already using URLs: ${skippedCount}`);
    console.log(`Updated to placeholders: ${updateCount}`);

    console.log('\nUpdate complete! Please now check the admin panel to verify transactions display correctly.');
  } catch (error) {
    console.error('Update failed:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the update
updateTransactionImageUrls();
