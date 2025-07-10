/**
 * Non-Sequential Ticket Manager
 * 
 * This utility module helps manage non-sequential ticket assignments
 * for the Venezuelan Raffle Website. It ensures:
 * 
 * 1. Four-digit ticket numbers (0001-9999)
 * 2. Non-sequential assignment
 * 3. Preventing reassignment of sold tickets
 * 4. Updating percentage available
 */

class NonSequentialTicketManager {
  /**
   * Generate random non-sequential ticket numbers
   * @param {Number} count - Number of tickets to generate
   * @param {Array} soldTickets - Array of already sold tickets to avoid
   * @param {Number} min - Minimum ticket number (default: 1)
   * @param {Number} max - Maximum ticket number (default: 9999)
   * @returns {Array} Array of unique, non-sequential ticket numbers
   */
  static generateNonSequentialTickets(count, soldTickets = [], min = 1, max = 9999) {
    console.log(`Generating ${count} non-sequential tickets...`);
    console.log(`Avoiding ${soldTickets.length} already sold tickets`);
    
    // Create a set of sold tickets for faster lookups
    const soldTicketsSet = new Set(soldTickets.map(t => parseInt(t)));
    
    // Function to check if a number is sequential to any in our result set
    const isSequential = (num, selectedNumbers) => {
      return selectedNumbers.some(selected => Math.abs(selected - num) === 1);
    };
    
    const selectedNumbers = [];
    let attempts = 0;
    const maxAttempts = 10000; // Prevent infinite loops
    
    while (selectedNumbers.length < count && attempts < maxAttempts) {
      attempts++;
      
      // Generate a random number between min and max
      const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
      
      // Check if this number is already sold or already selected
      if (soldTicketsSet.has(randomNum) || selectedNumbers.includes(randomNum)) {
        continue;
      }
      
      // Check if this number is sequential to any previously selected number
      if (isSequential(randomNum, selectedNumbers)) {
        continue;
      }
      
      // Add this number to our results
      selectedNumbers.push(randomNum);
    }
    
    // Format numbers as four-digit strings with leading zeros
    return selectedNumbers.map(num => num.toString().padStart(4, '0'));
  }
  
  /**
   * Calculate percentage of tickets sold
   * @param {Number} soldCount - Number of tickets sold
   * @param {Number} totalCount - Total number of tickets
   * @returns {Number} Percentage sold (0-100)
   */
  static calculatePercentageSold(soldCount, totalCount) {
    return Math.round((soldCount / totalCount) * 100);
  }
  
  /**
   * Update raffle with newly sold tickets
   * @param {Object} raffle - Raffle object from database
   * @param {Array} newSoldTickets - Array of newly sold tickets
   * @returns {Object} Updated raffle object
   */
  static updateRaffleWithSoldTickets(raffle, newSoldTickets) {
    // Combine existing sold tickets with new ones
    const allSoldTickets = [...(raffle.soldTickets || []), ...newSoldTickets];
    
    // Update available tickets count
    const availableTickets = raffle.totalTickets - allSoldTickets.length;
    
    // Calculate new percentage sold
    const percentageSold = this.calculatePercentageSold(
      allSoldTickets.length, 
      raffle.totalTickets
    );
    
    return {
      ...raffle,
      soldTickets: allSoldTickets,
      availableTickets: availableTickets,
      percentageSold: percentageSold
    };
  }
}

module.exports = NonSequentialTicketManager;
