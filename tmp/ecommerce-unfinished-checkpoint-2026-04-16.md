# E-commerce unfinished checkpoint

Date: 2026-04-16 UTC

## Current working surfaces
- Frontend preview: `https://atlasarchitect.ai/ecommerce-preview/`
- XAMPP backend public path: `https://atlasarchitect.ai/ecommerce-local/`
- XAMPP backend local path: `http://127.0.0.1:8080/ecommerce-local/`

## Backend status
The XAMPP/PHP + MariaDB backend is no longer just a health check.
It now has real API surfaces for:
- auth
- cart
- checkout
- orders
- admin orders
- admin inventory
- admin customers
- admin analytics

Checkout currently performs real backend-side creation of:
- order
- order_items
- payment record
- inventory decrement

## Backend code location
- `/opt/lampp/htdocs/ecommerce-local`

## Frontend code location
- `/root/.openclaw/workspace/tmp/ecommerce_demo`

## What is unfinished
1. The React frontend is still not wired to the new PHP/XAMPP backend.
2. The frontend still contains mock/local-state behavior in multiple places.
3. Login, cart, checkout, account, and dashboard pages need API integration.
4. Admin pages exist visually but are not yet fully connected to live backend endpoints.
5. End-to-end browser-level testing has not yet been completed against the integrated flow.

## Recommended next build order
1. Replace frontend auth mock flow with `/ecommerce-local/api/auth/*`
2. Replace frontend cart state with `/ecommerce-local/api/cart/*`
3. Replace checkout fake processing with `/ecommerce-local/api/checkout/create.php`
4. Replace account order history with `/ecommerce-local/api/orders/list.php`
5. Wire admin pages to:
   - `/ecommerce-local/api/admin/orders.php`
   - `/ecommerce-local/api/admin/inventory.php`
   - `/ecommerce-local/api/admin/customers.php`
   - `/ecommerce-local/api/admin/analytics.php`
6. Run end-to-end testing and fix integration issues

## Demo credentials
Customer:
- `sarah.johnson@example.com` / `demo1234`
- `michael.chen@example.com` / `demo1234`

Admin:
- `admin@greenfieldhub.local` / `admin1234`

## Important truth
There is no active hidden in-flight run at the moment.
The unfinished work is visible and saved, not trapped in a lost turn.
