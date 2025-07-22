import React, { useEffect, useRef } from 'react';

/**
 * A progress bar component that uses HTML Canvas to render, bypassing CSS styling issues
 */
const CanvasProgressBar = ({ progress = 0, width = '100%', height = '10px' }) => {
  const canvasRef = useRef(null);
  
  // Draw the progress bar on the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const remainingPercentage = 100 - progress;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background (gray)
    ctx.fillStyle = '#374151';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    
    // Determine color based on remaining percentage
    let progressColor;
    if (remainingPercentage < 20) {
      progressColor = '#EF4444'; // Red for nearly sold out
    } else if (remainingPercentage < 60) {
      progressColor = '#F59E0B'; // Yellow/orange for limited availability
    } else {
      progressColor = '#10B981'; // Green for plenty available
    }
    
    // Draw progress
    ctx.fillStyle = progressColor;
    const progressWidth = (progress / 100) * canvas.width;
    ctx.fillRect(0, 0, progressWidth, canvas.height);
    
  }, [progress]);
  
  return (
    <div style={{ width, height }}>
      <canvas 
        ref={canvasRef}
        width={500} // Fixed width for canvas drawing (will be scaled by CSS)
        height={20} // Fixed height for canvas drawing (will be scaled by CSS)
        style={{ 
          width: '100%', 
          height: '100%',
          borderRadius: '9999px',
        }}
      />
    </div>
  );
};

export default CanvasProgressBar;
