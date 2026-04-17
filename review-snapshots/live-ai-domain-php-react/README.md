# Live .ai domain review snapshot

This snapshot preserves the earlier working ecommerce implementation that was deployed for temporary review at:
- https://atlasarchitect.ai/ecommerce-local/app/

## What this snapshot contains
- `backend/` - the PHP/XAMPP/MariaDB ecommerce backend source used for the live review lane
- `frontend/` - the React/Vite frontend source that was wired to that backend

## Important context
This snapshot is **not** the canonical long-term project direction.
It exists to preserve the previously working live implementation in GitHub.

Canonical direction remains:
- desktop-local runtime
- Django backend
- Python
- SQLite
- existing frontend
- Node.js only for frontend tooling

## Safety note
Machine-specific database credentials were sanitized before this snapshot was prepared for GitHub.
The `backend/config/database.php` file now contains placeholders and must be configured locally before use.

## Live reference paths
- Storefront app: `https://atlasarchitect.ai/ecommerce-local/app/`
- Admin login: `https://atlasarchitect.ai/ecommerce-local/app/admin-login`
- Backend reference surface: `https://atlasarchitect.ai/ecommerce-local/`
