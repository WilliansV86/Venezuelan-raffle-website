# Script to test the transaction approval API endpoint directly

# --- CONFIGURATION ---
# Replace with the ID of a PENDING transaction
$transactionId = "688fc63c616c0db02b19da40" 

# Admin authorization token
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluX3VzZXIiLCJpYXQiOjE3NTQyNTE3ODksImV4cCI6MTc1Njg0Mzc4OX0.hYvgZF9N_xvPFKfCfib3amcSXJRC1dl3rKfmIvO0GvM"

# API Endpoint URL
$uri = "http://localhost:5100/api/transactions/$transactionId/status"

# --- REQUEST ---
# Request Body
$body = @{
    status = "approved"
} | ConvertTo-Json

# Request Headers
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type"  = "application/json"
}

# --- EXECUTION ---
Write-Host "Sending PUT request to: $uri"
Write-Host "Body: $body"
Write-Host "----------------------------------------"

try {
    # Measure how long the command takes
    $duration = Measure-Command {
        $response = Invoke-RestMethod -Uri $uri -Method Put -Headers $headers -Body $body
    }
    
    Write-Host "✅ Request successful!" -ForegroundColor Green
    Write-Host "Response:"
    Write-Host ($response | ConvertTo-Json -Depth 5)
    Write-Host "----------------------------------------"
    Write-Host "⏱️ Request duration: $($duration.TotalSeconds) seconds"
    
} catch {
    Write-Host "❌ Request failed!" -ForegroundColor Red
    Write-Host "Error Type: $($_.Exception.GetType().FullName)"
    Write-Host "Error Message: $($_.Exception.Message)"
    
    # Check for response content in the error record
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response
        $errorStream = $errorResponse.GetResponseStream()
        $streamReader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $streamReader.ReadToEnd()
        
        Write-Host "HTTP Status Code: $([int]$errorResponse.StatusCode)"
        Write-Host "Response Body:"
        Write-Host $errorBody
    }
    
    Write-Host "----------------------------------------"
}
