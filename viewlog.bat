@echo off
title ViewLog Backend
color 0A
echo ==================================================
echo PASURAHAN ECO-WEB - ViewLog Backend (Live)
echo ==================================================
echo.
if not exist backend.log type nul > backend.log
powershell -Command "Get-Content backend.log -Wait"
