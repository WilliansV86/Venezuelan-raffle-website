import React from 'react';

const LogoTest = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Logo Test</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Method 1: Direct import</h3>
        <img 
          src={require('../../public/loteria-tachira.png')} 
          alt="Test 1" 
          className="h-20 w-auto"
        />
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Method 2: Absolute path</h3>
        <img 
          src="/loteria-tachira.png" 
          alt="Test 2" 
          className="h-20 w-auto"
          onError={(e) => console.log('Error loading image 2:', e.target.src)}
        />
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Method 3: Full URL</h3>
        <img 
          src={`${window.location.origin}/loteria-tachira.png`} 
          alt="Test 3" 
          className="h-20 w-auto"
          onError={(e) => console.log('Error loading image 3:', e.target.src)}
        />
      </div>
    </div>
  );
};

export default LogoTest;
