// Simple Express server to test if port 5100 can be bound
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Test server is running!');
});

const PORT = 5100;
app.listen(PORT, () => {
  console.log(`Test server listening on port ${PORT}`);
});
