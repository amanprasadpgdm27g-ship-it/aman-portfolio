@echo off
set "PATH=C:\Users\amanl\.gemini\antigravity\bin\git\cmd;C:\Users\amanl\.gemini\antigravity\bin\gh;%PATH%"
cd /d "%~dp0"
echo ========================================================
echo   Aman Prasad Laheri - GitHub Portfolio Publisher
echo ========================================================
echo.
echo Step 1: Sign in to GitHub...
gh auth login --web -h github.com
echo.
echo Step 2: Creating repository and pushing code...
gh repo create aman-portfolio --public --source=. --remote=origin --push
echo.
echo Step 3: Enabling GitHub Pages deployment...
gh api repos/:owner/aman-portfolio/pages -X POST -F "source[branch]=main" -F "source[path]=/" 2>nul
echo.
echo ========================================================
echo   Portfolio successfully pushed to GitHub!
echo ========================================================
echo.
echo Go to: https://github.com/settings/pages to verify your live site!
pause
