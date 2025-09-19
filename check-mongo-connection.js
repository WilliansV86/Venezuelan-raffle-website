const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true&w=majority';

console.log('Attempting to connect to MongoDB...');

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB connection successful!');
    console.log('Connection state:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected');
    
    // Check if we have any data
    return mongoose.connection.db.collection('raffles').find().toArray();
  })
  .then(raffles => {
    console.log(`Found ${raffles.length} raffles in the database`);
    
    if (raffles.length > 0) {
      console.log('Active raffles:', raffles.filter(r => r.status === 'active').length);
      console.log('Completed raffles:', raffles.filter(r => r.status === 'completed').length);
      console.log('Draft raffles:', raffles.filter(r => r.status === 'draft').length);
    } else {
      console.log('No raffles found. The database may be empty.');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:');
    console.error(err);
  })
  .finally(() => {
    // Wait 5 seconds before disconnecting to allow seeing the output
    setTimeout(() => {
      mongoose.disconnect();
      console.log('Connection closed');
      console.log('Press Ctrl+C to exit');
    }, 5000);
  });
