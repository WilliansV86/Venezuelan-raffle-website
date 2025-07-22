import React from 'react';

/**
 * A progress bar component that uses pre-rendered SVG images
 * to ensure consistent color display across environments.
 */
const ImageProgressBar = ({ progress = 0, height = '10px' }) => {
  const remainingPercentage = 100 - progress;
  
  // Determine which color image to use based on progress
  let progressImage;
  if (remainingPercentage < 20) {
    progressImage = '/images/progress-red.svg';
  } else if (remainingPercentage < 60) {
    progressImage = '/images/progress-yellow.svg';
  } else {
    progressImage = '/images/progress-green.svg';
  }

  return (
    <div 
      style={{
        position: 'relative',
        height: height,
        width: '100%',
        borderRadius: '9999px',
        overflow: 'hidden',
      }}
    >
      {/* Background track */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(/images/progress-bg.svg)`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Foreground progress bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: `${progress}%`,
          backgroundImage: `url(${progressImage})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      />
    </div>
  );
};

export default ImageProgressBar;
