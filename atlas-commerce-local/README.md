# Greenfield Local Hub (GLH) Digital Solution Prototype

This repository contains a functional prototype for Greenfield Local Hub (GLH), a cooperative of local farmers and food producers.

## Project purpose
The prototype is designed to help GLH:
- present information about producers, their methods, and the benefits of buying locally
- show products with transparent pricing and availability
- allow customers to place orders for collection or delivery
- let customers manage their accounts and view order history
- provide a producer dashboard for stock levels, product updates, and order visibility

## Technology stack
- Frontend: React + Vite + TypeScript
- Backend: Django + Django REST Framework
- Database: SQLite
- Runtime target: local desktop machine

## Project structure
- `frontend/` customer-facing and dashboard user interface
- `backend/` Django API, business logic, and data models
- `docs/` project documentation, logs, and supporting records
- `scripts/` local startup scripts
- `SETUP.md` local setup and run instructions

## Current implemented modules
- `users`
- `products`
- `cart`
- `orders`
- `dashboard`
- `common`

## Current implemented flows
- customer login
- admin login
- session-backed account flow
- product listing with producer metadata and live availability
- add to cart and update cart
- checkout preview and order placement
- collection or delivery selection with requested time window and order note
- customer order history
- admin overview
- inventory read and product-detail update
- order status update
- customer analytics view
- frontend production build

## Documentation
Project-facing documentation is stored in `docs/`.

Start with:
- `docs/README.md`

Core project documents:
- `client-brief.md`
- `features-map.md`
- `assets-log.md`
- `functional-flow.md`
- `testing-log.md`
- `development-log.md`
- `security-accessibility-legal.md`
- `maintainability-guidelines.md`

## Demo seed support
The backend includes a local demo seed command:

```powershell
python manage.py seed_demo_data
```

Demo credentials after seeding:
- Admin: `admin@glh.local` / `admin1234`
- Customer: `sarah@glh.local` / `demo1234`

## Local runtime target
Recommended local project path:

`C:\Projects\ecommerce-prototype\`

## Next step
Follow `SETUP.md` to run the project locally.
