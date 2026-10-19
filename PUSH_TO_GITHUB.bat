@echo off
chcp 65001 >nul
title رفع مشروع System Tree House إلى GitHub

echo =====================================================================
echo   🚀 رفع منظومة System Tree House إلى GitHub بنقرة واحدة
echo =====================================================================
echo.
echo الحساب المسجل: abdelrahmanibrahimattia-debug
echo المستودع:     https://github.com/abdelrahmanibrahimattia-debug/system-tree-house
echo.

git remote remove origin >nul 2>&1
git remote add origin https://github.com/abdelrahmanibrahimattia-debug/system-tree-house.git
git branch -M main

echo ⏳ جاري الرفع لـ GitHub...
git push -u origin main

if %errorlevel% equ 0 (
  echo.
  echo ✅ تم الرفع بنجاح!
  echo الرابط: https://github.com/abdelrahmanibrahimattia-debug/system-tree-house
  timeout /t 2 >nul
  start https://github.com/abdelrahmanibrahimattia-debug/system-tree-house
) else (
  echo.
  echo ⚠️ تأكد من إنشاء المستودع أولاً: https://github.com/new
  pause
)
