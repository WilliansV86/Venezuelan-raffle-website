// Simple connection test script to verify backend connectivity
const testBackendConnection = async () => {
  const url = 'http://localhost:5100/api/health';
  console.log('Testing backend connection to:', url);
  
  try {
    const response = await fetch(url, { 
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Connection successful! Response:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Connection test failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Export the function for use in components
export default testBackendConnection;
