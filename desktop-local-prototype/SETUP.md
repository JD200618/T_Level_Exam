# Desktop setup

## 1. Copy project locally
Recommended path:

`C:\Projects\ecommerce-prototype\`

## 2. Backend terminal
Open VS Code terminal in:

`backend`

Run:

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## 3. Frontend terminal
Open VS Code terminal in:

`frontend`

Run:

```powershell
npm install
npm run dev
```

## 4. Local URLs
- Django API: `http://127.0.0.1:8000/`
- Frontend dev: `http://127.0.0.1:5173/`

## 5. Notes
- Keep repo private.
- Keep `.env` local.
- No personal information should be pushed publicly.
