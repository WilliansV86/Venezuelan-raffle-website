// This is a snippet to modify the progress bar calculation in RaffleCard.js
// Find the progress calculation and replace it with this code

// Calculate progress percentage - use displayProgressValue if available in manual mode
const progressPercentage = raffle.displayProgressMode === 'manual' && raffle.displayProgressValue !== null
  ? raffle.displayProgressValue
  : Math.round(((raffle.soldTickets || 0) / raffle.maxTickets) * 100);
