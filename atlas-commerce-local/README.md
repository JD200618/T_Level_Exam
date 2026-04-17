# E-commerce Prototype (Desktop Local)

Local-only canonical prototype for the next project phase.

## Intended stack
- Backend: Django + Django REST Framework
- Database: SQLite
- Frontend: existing frontend code
- Editor: VS Code
- Runtime: local desktop only

## Current backend implementation
The backend now includes real first-pass app structure for:
- `users`
- `products`
- `cart`
- `orders`
- `dashboard`
- `common`

The API is structured around thin views and service modules, in line with the Atlas/Zeus coding contract.

## Root structure
- `backend/` Django backend
- `frontend/` existing frontend code goes here
- `docs/` setup notes
- `scripts/` local run scripts

## Key API routes
- `GET /api/common/health/`
- `GET /api/users/me/`
- `POST /api/users/login/`
- `POST /api/users/logout/`
- `GET /api/products/`
- `GET /api/products/categories/`
- `GET /api/products/<slug>/`
- `GET /api/cart/`
- `POST /api/cart/items/`
- `PATCH /api/cart/items/<id>/`
- `DELETE /api/cart/items/<id>/`
- `POST /api/orders/checkout/preview/`
- `POST /api/orders/checkout/place/`
- `GET /api/orders/`
- `GET /api/dashboard/summary/`

## Demo seed support
A demo seed command is included in the backend:

```powershell
python manage.py seed_demo_data
```

Seeded demo credentials:
- Admin: `admin@atlas.local` / `admin1234`
- Customer: `sarah@atlas.local` / `demo1234`

## Next move
When Architect is back at the desktop, copy or clone this folder to:

`C:\Projects\ecommerce-prototype\`

Then follow `SETUP.md`.
