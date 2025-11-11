import React, { useState } from 'react';

const ImageDiagnostic = ({ paymentScreenshot }) => {
  const [diagResults, setDiagResults] = useState([]);
  const [testingComplete, setTestingComplete] = useState(false);
  
  // Create all possible URL variations to test
  const runDiagnostics = async () => {
    setDiagResults([]);
    setTestingComplete(false);
    
    // Basic information about the screenshot path
    addResult('Raw value:', paymentScreenshot);
    addResult('Type:', typeof paymentScreenshot);
    
    if (!paymentScreenshot) {
      addResult('ERROR: No paymentScreenshot value provided');
      setTestingComplete(true);
      return;
    }
    
    // Create a list of possible URLs to test
    const possibleUrls = [];
    
    // 1. Direct value as stored
    possibleUrls.push({ 
      description: 'Direct value as stored', 
      url: paymentScreenshot 
    });
    
    // 2. With production base URL (common format)
    possibleUrls.push({ 
      description: 'Production base URL + full path', 
      url: `https://tu-suerte-esta-aqui-ve.onrender.com/uploads/${paymentScreenshot}` 
    });
    
    // 3. With production base URL but assuming it has /uploads/ already
    if (paymentScreenshot.includes('/uploads/')) {
      possibleUrls.push({ 
        description: 'Production base URL + path with /uploads/', 
        url: `https://tu-suerte-esta-aqui-ve.onrender.com${paymentScreenshot}` 
      });
    }
    
    // 4. Just the filename if there's a path
    if (paymentScreenshot.includes('/')) {
      const filename = paymentScreenshot.split('/').pop();
      possibleUrls.push({ 
        description: 'Production base URL + filename only', 
        url: `https://tu-suerte-esta-aqui-ve.onrender.com/uploads/${filename}` 
      });
    }
    
    // Test each URL
    addResult('Testing URLs...');
    
    for (const item of possibleUrls) {
      await testImageUrl(item.url, item.description);
    }
    
    setTestingComplete(true);
  };
  
  // Test if an image URL is accessible
  const testImageUrl = (url, description) => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        addResult(`✅ SUCCESS: ${description}`, url);
        resolve(true);
      };
      img.onerror = () => {
        addResult(`❌ FAILED: ${description}`, url);
        resolve(false);
      };
      img.src = url;
      
      // Set a timeout in case it hangs
      setTimeout(() => {
        if (!img.complete) {
          addResult(`⏱️ TIMEOUT: ${description}`, url);
          resolve(false);
        }
      }, 5000);
    });
  };
  
  const addResult = (message, detail = '') => {
    setDiagResults(prev => [...prev, { message, detail }]);
  };
  
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 my-4 text-sm">
      <div className="flex justify-between mb-4">
        <h3 className="text-white font-bold">Image Diagnostic Tool</h3>
        <button 
          onClick={runDiagnostics}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500"
        >
          Run Tests
        </button>
      </div>
      
      {diagResults.length > 0 && (
        <div className="bg-gray-900 p-3 rounded overflow-auto max-h-60">
          {diagResults.map((result, index) => (
            <div key={index} className="mb-1 font-mono">
              <span className="text-gray-300">{result.message}</span>
              {result.detail && (
                <span className="text-blue-400 ml-2 break-all">{result.detail}</span>
              )}
            </div>
          ))}
          
          {testingComplete && (
            <div className="mt-4 border-t border-gray-700 pt-2">
              <p className="text-green-400">Testing complete! Check the results above.</p>
              <p className="text-gray-400 text-xs mt-2">
                Copy these results when reporting the issue.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageDiagnostic;
