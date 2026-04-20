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

## Recommended path
This project is designed to stay readable and source-visible while still being portable across desktops.

That means:
- keep the real frontend/backend/database structure
- keep `.venv` and `node_modules` as machine-local generated folders
- reduce user effort through scripts instead of pretending the runtime layers do not exist

See `docs/local-portability-path.md` for the reasoning behind this direction.

## Prerequisites
Install these tools on the desktop machine:
- VS Code
- Python 3 with the Windows `py` launcher available
- Node.js
- Git or GitHub Desktop

## First-time bootstrap on a new desktop
The easiest Windows-first flow is:

```powershell
cd scripts
.\bootstrap-local.cmd
```

This creates the backend virtual environment, installs backend packages, runs migrations, seeds demo data, and installs frontend packages.

## Backend setup
If you want to run the backend manually, open a terminal in:

`backend`

Run:

```powershell
py -m venv .venv
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo_data
python manage.py runserver
```

## Frontend setup
Open a second terminal in:

`frontend`

Run:

```powershell
npm.cmd install
npm.cmd run dev
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
- Treat `.venv`, `node_modules`, and other generated folders as local machine setup, not as source code to judge the project by.
- Use the logs in `docs/` to record assets, testing, and development changes.
