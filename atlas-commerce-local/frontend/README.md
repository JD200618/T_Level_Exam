# GLH frontend

This folder contains the React frontend for the Greenfield Local Hub (GLH) digital solution prototype.

## Purpose
The frontend provides:
- customer-facing product browsing
- cart and checkout flow
- account and order history views
- producer/admin dashboard views

Technical reference material that does not need to be part of the live student demo has been moved into `../docs/archive/frontend-reference-ui/`.

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
