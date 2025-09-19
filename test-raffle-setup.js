// Simple script to create test raffles and verify they appear correctly
const axios = require('axios');
const API_URL = 'http://localhost:5100/api';

// Admin token for authorization (you'll need to replace this with a valid token)
// You can get this by logging into the admin panel and checking localStorage
let adminToken = ''; // Replace with your admin token

// Function to log in and get admin token
async function loginAdmin() {
  try {
    const response = await axios.post(`${API_URL}/admin/login`, {
      password: 'test-admin-key-123' // This is from your .env file
    });
    console.log('Login successful:', response.data);
    adminToken = response.data.token;
    return true;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    return false;
  }
}

// Create a test active raffle
async function createActiveRaffle() {
  try {
    // Set current date
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 30); // Draw date 30 days in the future
    
    // Define raffle data
    const raffleData = new FormData();
    raffleData.append('name', 'Test Active Raffle');
    raffleData.append('price', '5');
    raffleData.append('priceBS', '150');
    raffleData.append('maxTickets', '100');
    raffleData.append('drawDate', futureDate.toISOString());
    raffleData.append('status', 'active');
    
    // You need an actual image file here
    // For testing purposes, we'll just use a URL
    raffleData.append('image', 'https://via.placeholder.com/300');
    
    const response = await axios.post(`${API_URL}/raffles`, raffleData, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('Active raffle created:', response.data);
    return response.data._id;
  } catch (error) {
    console.error('Error creating active raffle:', error.response?.data || error.message);
    return null;
  }
}

// Create a test completed raffle
async function createCompletedRaffle() {
  try {
    // Set past date
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 10); // Draw date 10 days in the past
    
    // Define raffle data
    const raffleData = new FormData();
    raffleData.append('name', 'Test Completed Raffle');
    raffleData.append('price', '3');
    raffleData.append('priceBS', '90');
    raffleData.append('maxTickets', '50');
    raffleData.append('drawDate', pastDate.toISOString());
    raffleData.append('status', 'completed');
    
    // You need an actual image file here
    // For testing purposes, we'll just use a URL
    raffleData.append('image', 'https://via.placeholder.com/300');
    
    const response = await axios.post(`${API_URL}/raffles`, raffleData, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('Completed raffle created:', response.data);
    return response.data._id;
  } catch (error) {
    console.error('Error creating completed raffle:', error.response?.data || error.message);
    return null;
  }
}

// Check if raffles are showing correctly
async function checkRaffleDisplay() {
  try {
    // Check active raffles
    const activeResponse = await axios.get(`${API_URL}/raffles`);
    console.log('Active raffles:', activeResponse.data);
    
    // Check past raffles
    const pastResponse = await axios.get(`${API_URL}/raffles/past`);
    console.log('Past raffles:', pastResponse.data);
    
    return true;
  } catch (error) {
    console.error('Error checking raffle display:', error.response?.data || error.message);
    return false;
  }
}

// Update a raffle's status
async function updateRaffleStatus(id, status) {
  try {
    const response = await axios.put(`${API_URL}/raffles/${id}/status`, 
      { status }, 
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      }
    );
    console.log(`Raffle ${id} status updated to ${status}:`, response.data);
    return true;
  } catch (error) {
    console.error(`Error updating raffle ${id} status:`, error.response?.data || error.message);
    return false;
  }
}

// Main function
async function run() {
  console.log('Starting raffle test setup...');
  
  // Step 1: Login to get admin token
  const loginSuccess = await loginAdmin();
  if (!loginSuccess) {
    console.error('Cannot proceed without admin access');
    return;
  }
  
  // Step 2: Check if we already have active and past raffles
  console.log('Checking existing raffles...');
  await checkRaffleDisplay();
  
  // Step 3: Create test raffles if needed
  console.log('Creating test raffles...');
  const activeId = await createActiveRaffle();
  const completedId = await createCompletedRaffle();
  
  // Step 4: Verify the display again
  console.log('Verifying raffle display...');
  await checkRaffleDisplay();
  
  console.log('Test complete!');
}

run().catch(console.error);
