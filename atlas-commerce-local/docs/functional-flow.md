# Functional flow and code structure

This document explains how the GLH prototype is intended to operate as a layered modular system.

## 1. Root routing layer
This layer decides how users and producers move through the application.

### Frontend routes
- `/` home page with local-buying benefits and key producer highlights
- `/producers` producer information and local sourcing view
- `/shop` product catalogue and availability view
- `/cart` cart state and quantity management
- `/checkout` collection or delivery order flow
- `/account` profile, addresses, payment methods, and order history
- `/dashboard/*` producer/admin operational views

### Backend mounting
- `/api/products/` catalogue data
- `/api/cart/` active cart state
- `/api/orders/` order creation and history
- `/api/users/` identity and account data
- `/api/dashboard/` producer/admin operational data

## 2. Contract layer
This is the shared agreement between frontend and backend.

### Shared global logic
- `frontend/src/app/lib/api.ts`
  - central API requests
  - response mapping
  - shared data types
  - CSRF-aware request handling
- `frontend/src/app/context/AuthContext.tsx`
  - current user hydration
  - session-aware account state
- `frontend/src/app/context/CartContext.tsx`
  - cart loading and write actions

If this layer is wrong, the frontend and backend stop speaking cleanly.

## 3. Identity and session layer
This layer makes customer and producer access possible.

### Backend
- `backend/apps/users/*`

### Frontend
- login page
- admin login page
- account page
- auth context

### Functional outcome
- customer login
- profile refresh
- address and payment management
- order history access
- producer/admin dashboard access by role

## 4. Catalogue and producer-information layer
This layer gives the project real GLH meaning.

### Backend
- `backend/apps/products/*`

### Frontend
- home page
- producers page
- shop page
- product card component

### Functional outcome
- named producers
- production methods
- product pricing
- live stock visibility
- local-buying explanation

Without this layer, there is no meaningful GLH catalogue.

## 5. Cart layer
This layer turns browsing into product selection.

### Backend
- `backend/apps/cart/*`

### Frontend
- cart context
- cart page
- add-to-cart actions from product cards

### Functional outcome
- active cart state
- item quantity updates
- remove and clear actions

## 6. Checkout and order layer
This layer converts a cart into a completed transaction.

### Backend
- `backend/apps/orders/*`

### Frontend
- checkout page
- account order-history view
- dashboard orders view

### Functional outcome
- collection or delivery selection
- requested time window
- order note
- order creation
- order history and status tracking

Without this layer, the system cannot complete a purchase.

## 7. Producer dashboard layer
This layer lets GLH or producer-side staff operate the system.

### Backend
- `backend/apps/dashboard/*`

### Frontend
- dashboard overview
- dashboard inventory
- dashboard orders
- dashboard customers
- dashboard analytics

### Functional outcome
- stock updates
- product detail editing
- producer information updates
- order status updates
- customer and revenue visibility

Without this layer, producers cannot maintain the live system.

## 8. Documentation and compliance layer
This layer completes the deliverable beyond code execution.

### Project documents
- `client-brief.md`
- `features-map.md`
- `assets-log.md`
- `testing-log.md`
- `development-log.md`
- `security-accessibility-legal.md`
- `maintainability-guidelines.md`

### Functional outcome
- clear audit trail
- explainable development history
- better handover to a third-party developer

## Global vs local logic rule

### Global/shared logic should be used for:
- API communication
- session and cart state
- repeated data transformation
- reusable cross-page helpers

### Local logic should stay local for:
- individual page forms
- page-specific editing state
- component button handlers
- one-page presentation flow

## Practical sequence examples

### Customer order sequence
1. customer opens `/shop`
2. product data loads through `api.ts`
3. cart actions go through `CartContext`
4. checkout sends order data to `/api/orders/checkout/place/`
5. account view reloads order history from `/api/orders/`

### Producer update sequence
1. producer opens `/dashboard/inventory`
2. inventory data loads from `/api/dashboard/admin/inventory/`
3. local editor state is changed in the page
4. save action sends patch request through `api.ts`
5. refreshed inventory returns from the backend and updates the table

This is the intended operational structure of the GLH prototype.
