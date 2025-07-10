/**
 * Local test for ticket number generation and validation
 * (Does not require MongoDB connection)
 */

console.log('--- TESTING TICKET NUMBER GENERATION ---\n');

// Test random 4-digit ticket generation
function generateRandomTicketNumber() {
  const randomNum = Math.floor(Math.random() * 10000);
  return randomNum.toString().padStart(4, '0');
}

// Test min ticket validation
function validateMinimumTickets(paymentMethod, ticketCount) {
  const minRequired = (paymentMethod === 'zelle' || paymentMethod === 'binance') ? 10 : 1;
  return ticketCount >= minRequired;
}

// Generate sample ticket numbers
console.log('Generating 20 random ticket numbers:');
const ticketNumbers = [];
const takenNumbers = new Set();

for (let i = 0; i < 20; i++) {
  let ticketNumber;
  do {
    ticketNumber = generateRandomTicketNumber();
  } while (takenNumbers.has(ticketNumber));
  
  ticketNumbers.push(ticketNumber);
  takenNumbers.add(ticketNumber);
}

console.log(ticketNumbers);

// Verify format: all are 4 digits with leading zeros
const validFormat = ticketNumbers.every(num => /^\d{4}$/.test(num));
console.log(`\nAll tickets have valid 4-digit format: ${validFormat ? '✅ YES' : '❌ NO'}`);

// Check for duplicates
const uniqueNumbers = new Set(ticketNumbers);
console.log(`All tickets are unique: ${uniqueNumbers.size === ticketNumbers.length ? '✅ YES' : '❌ NO'}`);

// Test minimum ticket validation
console.log('\n--- TESTING MINIMUM TICKET VALIDATION ---\n');

const testCases = [
  { method: 'pago-movil', count: 1, expected: true },
  { method: 'pago-movil', count: 5, expected: true },
  { method: 'zelle', count: 5, expected: false },
  { method: 'zelle', count: 10, expected: true },
  { method: 'binance', count: 9, expected: false },
  { method: 'binance', count: 10, expected: true },
  { method: 'binance', count: 15, expected: true },
];

testCases.forEach(test => {
  const result = validateMinimumTickets(test.method, test.count);
  const pass = result === test.expected;
  console.log(`Payment Method: ${test.method}, Tickets: ${test.count}, Result: ${result ? 'PASS' : 'FAIL'} ${pass ? '✅' : '❌'}`);
});

console.log('\n--- TEST COMPLETED ---');
