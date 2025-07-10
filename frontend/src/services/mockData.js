// Temporary mock data to allow frontend testing without backend

export const mockRaffle = {
  _id: '1', // Match the ID in the URL - raffle/1
  title: 'Sorteo Especial de Julio',
  description: 'Gran sorteo con premios increíbles',
  drawDate: new Date(2025, 8, 15).toISOString(),
  imageUrl: '/images/logo-loteria-tachira-transparent.png',
  ticketsTotal: 1000,
  ticketsSold: 320,
  ticketPrice: 1.5,
  exchangeRateUSD: 35,
  active: true,
  minTicketsPaypal: 1,
  minTicketsZelle: 2,
  minTicketsBinance: 3,
  minTicketsReserve: 5,
  prizes: [
    { place: 1, description: 'Premio Mayor: $5000 USD', amount: 5000 },
    { place: 2, description: 'Segundo Premio: $1000 USD', amount: 1000 },
    { place: 3, description: 'Tercer Premio: $500 USD', amount: 500 }
  ],
  paymentMethods: ['PayPal', 'Zelle', 'Binance', 'Reservado'],
  rules: 'Términos y condiciones del sorteo...'
};

export const mockTickets = [
  { number: '001', status: 'sold' },
  { number: '002', status: 'sold' },
  // Simulating sold tickets
  ...Array.from({ length: 318 }, (_, i) => ({
    number: `${(i + 3).toString().padStart(3, '0')}`,
    status: 'sold'
  })),
  // Simulating available tickets
  ...Array.from({ length: 680 }, (_, i) => ({
    number: `${(i + 321).toString().padStart(3, '0')}`,
    status: 'available'
  }))
];

export const mockPurchaseResponse = {
  success: true,
  message: 'Tickets purchased successfully',
  tickets: ['421', '422', '423', '424', '425']
};

// Mock availability response
export const mockAvailabilityResponse = {
  success: true,
  available: true,
  message: 'Hay tickets disponibles para este sorteo.'
};
