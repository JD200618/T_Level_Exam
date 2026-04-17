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
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo_data
python manage.py runserver
```

Or from the project root, just run:

```powershell
scripts\start-backend.cmd
```

## 3. Frontend terminal
Open VS Code terminal in:

`frontend`

Run:

```powershell
npm install
npm run dev
```

Or from the project root, just run:

```powershell
scripts\start-frontend.cmd
```

## 4. Local URLs
- Django API root: `http://127.0.0.1:8000/`
- Health check: `http://127.0.0.1:8000/api/common/health/`
- Frontend dev: `http://127.0.0.1:5173/`

## 5. First routes to test
- Storefront: `http://127.0.0.1:5173/`
- Health check: `http://127.0.0.1:8000/api/common/health/`
- Customer login: `sarah@atlas.local` / `demo1234`
- Admin login: `admin@atlas.local` / `admin1234`
- Products: `GET /api/products/`
- Cart: `GET /api/cart/`
- Checkout preview: `POST /api/orders/checkout/preview/`
- Orders: `GET /api/orders/`
- Admin overview: `GET /api/dashboard/admin/overview/`

## 6. Demo accounts after seeding
- Admin: `admin@atlas.local` / `admin1234`
- Customer: `sarah@atlas.local` / `demo1234`

## 7. Notes
- The frontend uses session auth and CSRF correctly. Let the app boot normally before trying login so the CSRF cookie is present.
- Keep repo private.
- Keep `.env` local.
- Do not commit `backend/db.sqlite3`.
- No personal information should be pushed publicly.
- This project is the canonical desktop-local Django lane, not the old public PHP lane.
