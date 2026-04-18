# Local setup instructions

## Recommended location
Save the project locally at:

`C:\Projects\ecommerce-prototype\`

If the repository is cloned under a different folder name, open the `atlas-commerce-local` project folder inside it.

## Open in VS Code or Visual Studio
To see the whole program together, open the project root, not just `frontend` or `backend`.

Recommended options:
- VS Code: open `atlas-commerce-local.code-workspace`
- VS Code: or open the folder `C:\Projects\ecommerce-prototype\atlas-commerce-local\`
- Visual Studio: use **Open a Local Folder** and select `C:\Projects\ecommerce-prototype\atlas-commerce-local\`

When opened from the root, the editor should show:
- `backend/`
- `frontend/`
- `docs/`
- `scripts/`
- `README.md`
- `SETUP.md`

## Prerequisites
Install these tools on the desktop machine:
- VS Code
- Python 3
- Node.js
- Git or GitHub Desktop

## Backend setup
Open a terminal in:

`backend`

Run:

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo_data
python manage.py runserver
```

If `python` is not available, try `py` instead.

## Frontend setup
Open a second terminal in:

`frontend`

Run:

```powershell
npm install
npm run dev
```

## Local URLs
- Frontend: `http://127.0.0.1:5173/`
- Backend: `http://127.0.0.1:8000/`
- Health check: `http://127.0.0.1:8000/api/common/health/`

## Demo accounts after seeding
- Admin: `admin@glh.local` / `admin1234`
- Customer: `sarah@glh.local` / `demo1234`

## Automated dependability test
Run this in `backend` after migrations and seeding:

```powershell
python manage.py test apps.common.tests -v 2
```

This checks the main layered flows across session, API, service, and database behavior.

## Suggested smoke test order
1. Open the frontend home page
2. Check the backend health endpoint
3. Load the product list
4. Add a product to the cart
5. Log in as the customer account
6. Place a test order
7. Log in as the admin account and review dashboard data

## Notes
- Keep the repository private while the prototype is in development.
- Keep `.env` files local.
- Do not store personal or client-sensitive data in public locations.
- Use the logs in `docs/` to record assets, testing, and development changes.
