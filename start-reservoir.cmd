@echo off
title Project Reservoir 🚰 Server
echo ======================================================
echo 🚰 Starting Project Reservoir Web App...
echo ======================================================
cd /d "%~dp0"
start http://localhost:3456
node server.js
pause
