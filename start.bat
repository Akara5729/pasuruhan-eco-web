@echo off
title Eco-Web Server
echo ==================================================
echo PASURAHAN ECO-WEB - Memulai Server Lokal
echo ==================================================
echo.
echo Membersihkan log lama...
type nul > backend.log

echo Membuka Jendela ViewLog...
start "ViewLog Backend" cmd /c "viewlog.bat"

echo.
echo Server sedang disiapkan...
echo Browser akan terbuka secara otomatis sesaat lagi.
echo.
echo PENTING: Biarkan jendela ini tetap terbuka selama 
echo Anda menggunakan aplikasi.
echo.
npm run dev -- --open
