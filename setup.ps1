# setup.ps1  —  One-shot GitHub push for AgriFlow
# ===================================================
# Run this from the project root:
#   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
#   .\setup.ps1
#
# Prerequisites:
#   - Git installed  (https://git-scm.com)
#   - GitHub CLI installed  (https://cli.github.com)  — OR create the repo manually first
#   - You are already logged in: gh auth login

$REPO_NAME   = "slagri"
$DESCRIPTION = "AgriFlow - Sri Lanka Agricultural Intelligence Platform"
$BRANCH      = "main"

Write-Host "`n🌿  AgriFlow — GitHub Setup" -ForegroundColor Green
Write-Host "================================`n"

# 1. Init git if needed
if (-not (Test-Path ".git")) {
    Write-Host "Initialising git repository..." -ForegroundColor Cyan
    git init
    git branch -M $BRANCH
} else {
    Write-Host "Git already initialised." -ForegroundColor Yellow
}

# 2. Create the GitHub repo via GitHub CLI
Write-Host "`nCreating GitHub repository '$REPO_NAME'..." -ForegroundColor Cyan
gh repo create $REPO_NAME --public --description $DESCRIPTION --source=. --remote=origin --push

if ($LASTEXITCODE -ne 0) {
    Write-Host "`ngh failed — trying manual push instead..." -ForegroundColor Yellow

    # Fallback: add, commit, push manually (repo must already exist on GitHub)
    git add -A
    git commit -m "Initial commit — AgriFlow platform"
    git remote add origin "https://github.com/$(gh api user --jq .login)/$REPO_NAME.git" 2>$null
    git push -u origin $BRANCH
}

Write-Host "`n✅  Done!" -ForegroundColor Green
Write-Host "   Repo : https://github.com/$(gh api user --jq .login)/$REPO_NAME" -ForegroundColor Cyan
Write-Host "   Next : Connect the repo to Netlify for the live URL`n" -ForegroundColor Cyan
