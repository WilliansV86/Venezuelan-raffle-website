# Test the purchase API endpoint directly with PowerShell

# Basic information for purchase with $1.5 per ticket
$ticketPrice = 1.5    # Price per ticket in USD
$ticketQuantity = 10  # Number of tickets
$totalAmount = $ticketPrice * $ticketQuantity * 100  # Convert to cents

$purchaseData = @{
    fullName = "Test User"
    email = "test@example.com"
    whatsappNumber = "+1 405 493 1227"
    identificationNumber = "V-17767135"
    paymentAmount = $totalAmount  # $1.5 per ticket * 10 tickets = $15 (but in cents = 1500)
    paymentMethod = "Zelle"
    paymentReference = "REF123456"
    raffleId = "649ab8f45cbb0d3f084c57a1"
    quantity = $ticketQuantity
}

# Convert to JSON
$jsonBody = $purchaseData | ConvertTo-Json

# Send request to purchase endpoint
try {
    Write-Host "Sending purchase request to API..."
    Write-Host "Details:"
    Write-Host "- Ticket price: $${ticketPrice}"
    Write-Host "- Ticket quantity: ${ticketQuantity}"
    Write-Host "- Total amount: $${ticketPrice * $ticketQuantity} (${totalAmount} cents)"
    Write-Host ""
    Write-Host "NOTE: This test doesn't include the payment proof image"
    Write-Host "since that requires multipart form data."
    Write-Host ""
    
    # Execute API call
    $response = Invoke-RestMethod -Uri "http://localhost:5001/api/tickets/purchase" -Method Post -Body $jsonBody -ContentType "application/json" -ErrorAction Stop
    
    # Show successful response
    Write-Host "Success! Purchase API responded:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 4
} catch {
    # Show error details
    Write-Host "Error calling purchase API:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails.Message) {
        Write-Host "Details:" 
        $_.ErrorDetails.Message
    }
}
