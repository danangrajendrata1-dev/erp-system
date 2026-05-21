@echo off
title ERP SYSTEM AUTO INSTALLER

echo =====================================
echo ERP SYSTEM AUTO INSTALLER
echo =====================================

cd /d C:\erp_project

echo.
echo [1/7] Checking Python...

python --version >nul 2>&1

if errorlevel 1 (
    echo Python belum terinstall.
    echo Installing Python...
    
    winget install Python.Python.3.12 -e --silent --accept-package-agreements --accept-source-agreements
    
) else (
    echo Python sudah tersedia.
)

echo.
echo [2/7] Checking Node.js...

node -v >nul 2>&1

if errorlevel 1 (
    echo Node.js belum terinstall.
    echo Installing Node.js...
    
    winget install OpenJS.NodeJS.LTS -e --silent --accept-package-agreements --accept-source-agreements
    
) else (
    echo Node.js sudah tersedia.
)

echo.
echo [3/7] Creating Virtual Environment...

python -m venv venv

echo.
echo [4/7] Activating Virtual Environment...

call venv\Scripts\activate

echo.
echo [5/7] Installing Backend Dependencies...

pip install -r requirements.txt

echo.
echo [6/7] Installing Frontend Dependencies...

cd frontend\erp-frontend

npm install

cd /d C:\erp_project

echo.
echo [7/7] Setup Finished

echo =====================================
echo ERP SYSTEM READY
echo =====================================

pause