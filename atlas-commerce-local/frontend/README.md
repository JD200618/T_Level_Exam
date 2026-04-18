# GLH frontend

This folder contains the React frontend for the Greenfield Local Hub (GLH) digital solution prototype.

## Purpose
The frontend provides:
- customer-facing product browsing
- cart and checkout flow
- account and order history views
- producer/admin dashboard views

Only the active frontend needed for the live GLH demo is kept in this folder. Older reference/demo UI material was removed from the tracked deliverable repo during cleanup.

## Run locally
```powershell
npm install
npm run dev
```

Default development URL:
- `http://127.0.0.1:5173/`

## Notes
- The frontend expects the Django backend to be running locally.
- API calls default to `http://127.0.0.1:8000/api` during local development unless `VITE_API_BASE` is set.
- Third-party attributions are recorded in `ATTRIBUTIONS.md`.
