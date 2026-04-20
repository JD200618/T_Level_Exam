@echo off
setlocal

cd /d %~dp0\..

where py >nul 2>nul
if errorlevel 1 (
  echo Python launcher 'py' was not found. Install Python 3 for Windows and try again.
  exit /b 1
)

echo [1/5] Preparing backend virtual environment...
cd /d %~dp0\..\backend
if not exist .venv (
  py -m venv .venv
)

call .venv\Scripts\activate.bat
if errorlevel 1 exit /b 1

echo [2/5] Installing backend requirements...
python -m pip install -r requirements.txt
if errorlevel 1 exit /b 1

echo [3/5] Applying database migrations...
python manage.py migrate
if errorlevel 1 exit /b 1

echo [4/5] Seeding demo data...
python manage.py seed_demo_data
if errorlevel 1 exit /b 1

echo [5/5] Installing frontend packages...
cd /d %~dp0\..\frontend
call npm.cmd install
if errorlevel 1 exit /b 1

echo.
echo Local bootstrap complete.
echo Next:
echo   1. Run scripts\start-backend.cmd
echo   2. Run scripts\start-frontend.cmd
