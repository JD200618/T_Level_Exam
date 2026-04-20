@echo off
setlocal
cd /d %~dp0\..\backend
if not exist .venv (
  py -m venv .venv
)
call .venv\Scripts\activate.bat
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo_data
python manage.py runserver
