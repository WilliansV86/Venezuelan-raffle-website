# PowerShell script to push codebase to GitHub as version9-clean
Write-Host "====================================================="
Write-Host "PUSHING VENEZUELAN RAFFLE WEBSITE TO GITHUB AS VERSION9-CLEAN"
Write-Host "====================================================="
Write-Host ""

# Set current directory to script location
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $scriptPath

Write-Host "1. Making sure git is initialized..."
if (-not (Test-Path ".git")) {
    git init
    Write-Host "Git repository initialized."
}

Write-Host "2. Adding all files to git..."
git add .

Write-Host "3. Creating commit for version9-clean..."
git commit -m "Saving work as version9-clean with improved email template and hidden ticket numbers"

Write-Host "4. Creating version9-clean branch..."
git checkout -b version9-clean

Write-Host "5. Checking if remote exists..."
$remoteExists = git remote -v | Select-String "origin"

if (-not $remoteExists) {
    Write-Host "No remote found. Please enter your GitHub repository URL:"
    $repoUrl = Read-Host "GitHub URL (e.g., https://github.com/username/repo.git)"
    git remote add origin $repoUrl
}
else {
    Write-Host "Remote origin already exists."
}

Write-Host "6. Pushing to GitHub..."
git push -u origin version9-clean

Write-Host ""
Write-Host "====================================================="
Write-Host "If push was successful, the version9-clean branch is now on GitHub."
Write-Host "This version includes the improved email template and hidden ticket numbers."
Write-Host "====================================================="
Write-Host "Press Enter to continue..."
Read-Host
