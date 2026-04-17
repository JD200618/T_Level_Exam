# E-commerce Prototype (Desktop Local)

Local-only canonical prototype for the next project phase.

## Intended stack
- Backend: Django + Django REST Framework
- Database: SQLite
- Frontend: existing frontend code
- Editor: VS Code
- Runtime: local desktop only

## Current backend implementation
The backend now includes working app structure for:
- `users`
- `products`
- `cart`
- `orders`
- `dashboard`
- `common`

The API is structured around thin views and service modules, in line with the Atlas/Zeus coding contract.

## Verified working flows
The canonical project has now been validated on-host for:
- customer login
- session-backed auth with CSRF handling
- product listing
- add to cart
- cart read/update flow foundation
- checkout preview
- place order
- customer order history
- admin overview
- admin inventory read/update
- admin order status update
- admin customers view
- admin analytics view
- frontend production build with Vite

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
- `GET /api/users/profile/`
- `PATCH /api/users/profile/`
- `GET /api/users/addresses/`
- `POST /api/users/addresses/`
- `PATCH /api/users/addresses/<id>/`
- `DELETE /api/users/addresses/<id>/`
- `GET /api/users/payment-methods/`
- `POST /api/users/payment-methods/`
- `DELETE /api/users/payment-methods/<id>/`
- `GET /api/products/`
- `GET /api/products/categories/`
- `GET /api/products/<slug>/`
- `GET /api/cart/`
- `DELETE /api/cart/`
- `POST /api/cart/items/`
- `PATCH /api/cart/items/<id>/`
- `DELETE /api/cart/items/<id>/`
- `POST /api/orders/checkout/preview/`
- `POST /api/orders/checkout/place/`
- `GET /api/orders/`
- `GET /api/orders/<id>/`
- `GET /api/dashboard/summary/`
- `GET /api/dashboard/admin/overview/`
- `GET /api/dashboard/admin/inventory/`
- `PATCH /api/dashboard/admin/inventory/<product_id>/`
- `GET /api/dashboard/admin/orders/`
- `PATCH /api/dashboard/admin/orders/<order_id>/status/`
- `GET /api/dashboard/admin/customers/`
- `GET /api/dashboard/admin/analytics/`

## Demo seed support
A demo seed command is included in the backend:

```powershell
python manage.py seed_demo_data
```

Seeded demo credentials:
- Admin: `admin@atlas.local` / `admin1234`
- Customer: `sarah@atlas.local` / `demo1234`

## Quick start
When Architect is back at the desktop, copy or clone this folder to:

`C:\Projects\ecommerce-prototype\`

Then either:
- run `scripts\start-backend.cmd`
- run `scripts\start-frontend.cmd`

or follow the manual steps in `SETUP.md`.
