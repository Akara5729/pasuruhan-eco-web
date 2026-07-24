@echo off
echo ==================================================
echo PASURAHAN ECO-WEB - Menghentikan Server
echo ==================================================
echo.
echo Mematikan semua proses server di latar belakang...
taskkill /F /IM node.exe /T >nul 2>&1

echo Menutup Jendela ViewLog...
taskkill /F /FI "WINDOWTITLE eq ViewLog Backend*" /T >nul 2>&1

echo.
echo Server berhasil dihentikan sepenuhnya.
pause
