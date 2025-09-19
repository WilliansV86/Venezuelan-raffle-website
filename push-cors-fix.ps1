# PowerShell script to push CORS fix to GitHub
Write-Host "====================================================="
Write-Host "PUSHING CORS FIX TO GITHUB"
Write-Host "====================================================="
Write-Host ""

# Set current directory to script location
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $scriptPath

# Create a temp directory for clean copy
$tempDir = "cors-fix-temp"
$fullTempPath = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath $tempDir

Write-Host "1. Creating temporary directory for clean copy..."
if (Test-Path $fullTempPath) {
    Remove-Item -Path $fullTempPath -Recurse -Force
}
New-Item -Path $fullTempPath -ItemType Directory | Out-Null

# Copy files, excluding sensitive ones
Write-Host "2. Copying files (excluding sensitive ones)..."
robocopy "$scriptPath" "$fullTempPath" /E /XF .env* *.env *apikey* /XD .git node_modules uploads/payment-proofs

# Create/update .gitignore
Write-Host "3. Creating comprehensive .gitignore..."
@"
# Node modules
node_modules/

# Environment files
.env
.env.local
.env.*
*.env
backend/.env*

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# API keys and secrets
*apikey*
*secret*
*password*

# Upload directories
uploads/payment-proofs/

# Build directories
build/
dist/
"@ | Out-File -FilePath "$fullTempPath\.gitignore" -Encoding utf8

Write-Host "4. Initializing Git repository in clean directory..."
Set-Location -Path $fullTempPath
git init

Write-Host "5. Adding all files..."
git add .

Write-Host "6. Creating commit for CORS fix..."
git commit -m "Fix CORS configuration to use environment variable"

Write-Host "7. Creating cors-fix branch..."
git checkout -b cors-fix

Write-Host "8. Setting up GitHub remote..."
$repoName = "WilliansV86/Venezuelan-raffle-website"
Write-Host "Using repository: $repoName"
git remote add origin "https://github.com/$repoName.git"

Write-Host "9. Pushing to GitHub..."
git push -u origin cors-fix --force

Write-Host ""
Write-Host "====================================================="
Write-Host "CORS fix has been pushed to GitHub in the 'cors-fix' branch."
Write-Host "Now go to Render.com and deploy this branch."
Write-Host "====================================================="
Write-Host "Temp directory location: $fullTempPath"
Write-Host ""
Write-Host "Script completed successfully."
