# Test the purchase API endpoint using curl

# API endpoint URL
$uri = "http://localhost:5100/api/tickets/purchase"

# Form fields
$curlArgs = @(
    "-F", 'firstName=Test',
    "-F", 'lastName=User',
    "-F", 'email=test@example.com',
    "-F", 'identificationNumber=V-12345678',
    "-F", 'whatsappNumber=+15551234567',
    "-F", 'paymentReference=ZELLE-REF-78910',
    "-F", 'quantity=2',
    "-F", 'paymentMethod=Zelle',
    "-F", 'raffleId=688e343b91768d1067cf9ac3',
    "-F", 'totalAmount=10.00',
    "-F", 'paymentProof=@.\payment-proof.png'
)

# Execute the curl command
try {
    Write-Host "Sending purchase request to API: $uri"
    Write-Host "Executing: curl.exe $($curlArgs -join ' ') $uri"
    
    $response = curl.exe @curlArgs $uri
    
    Write-Host "Success! Purchase API responded:" -ForegroundColor Green
    Write-Host $response
} catch {
    Write-Host "An error occurred while running curl:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
