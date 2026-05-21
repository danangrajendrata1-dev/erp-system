@echo off
title ERP SYSTEM

echo Starting Backend...

start cmd /k "cd /d C:\erp_project && call venv\Scripts\activate && uvicorn app.main:app --reload"

echo Starting Frontend...

start cmd /k "cd /d C:\erp_project\frontend\erp-frontend && npm run dev"

echo Waiting Server...

timeout /t 8

start http://localhost:3000