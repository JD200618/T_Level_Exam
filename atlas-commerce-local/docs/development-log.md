# Development log

Use this file to record iterative development changes and the reason for each change.

## 2026-04-17
- Refocused the project surface around the GLH brief rather than internal AI or runtime coordination material.
- Rewrote the top-level project README so it describes the GLH prototype, project purpose, structure, and current feature state.
- Rewrote setup instructions for neutral local-desktop use.
- Added project-facing documentation shells for:
  - client brief
  - feature mapping
  - assets log
  - testing log
  - security, accessibility, and legal notes
  - maintainability guidelines
- Added demo seed support documentation so the local project can be started in a usable state.
- Removed internal coordination material from the project-facing structure.
- Added a documentation landing page so opening the repository gives a clearer project-first view.
- Reduced script clutter by standardising around the `.cmd` and `.sh` launch paths.

## 2026-04-18
- Corrected the seeded demo credentials in the frontend login and admin-login screens so the UI matches the actual backend seed command.
- Expanded the seeded product catalogue with more categories and products so the shop looks like a real GLH catalogue instead of a near-empty stub.
- Added producer metadata to products, including producer name, location, and production method, then surfaced that information in the customer-facing catalogue.
- Reworked the homepage so it explains GLH as a cooperative, highlights producer value, and points users into the real catalogue and dashboard flow.
- Upgraded checkout so customers can choose collection or delivery, select a requested time window, and attach an order note.
- Extended stored orders so fulfilment method and requested time window appear in the account area and dashboard order management view.
- Upgraded the producer inventory screen so staff can edit price, summary, producer details, featured state, and stock from the dashboard, not just nudge stock up or down.
- Added migrations to persist the new producer and fulfilment fields in the backend data model.

## 2026-04-18
- Added a dedicated producer-information page so the GLH prototype shows named producers, locations, methods, and linked catalogue items more clearly.
- Updated home-page messaging and navigation so the storefront better reflects the GLH brief rather than a generic shop front.
- Strengthened the producer dashboard inventory flow by fixing the shared update payload path and adding a full local detail editor for stock, price, summary, producer details, and featured state.
- Replaced prompt-based account management with structured in-page forms for profile updates, address entry, and payment-method entry.
- Added repeatable Django integration tests to verify the main customer and admin flows across session, API, service, and database layers.
- Added `functional-flow.md` to explain the layered system and the shared-vs-local logic boundary for future maintenance.

## 2026-04-18
- Simplified the active frontend surface so the working GLH demo feels more like a student project and less like a generated component showcase.
- Removed the live routes for system architecture, data dictionary, and flowchart pages, then archived those files under `docs/archive/frontend-reference-ui/` instead of keeping them in the runtime app.
- Archived a large set of unused UI-kit component files so the active `src/app/components/ui` folder now matches the parts the app actually uses.
- Replaced the older split-out button/card/input/label/textarea/badge wrappers with a simpler shared `src/app/components/ui/core.tsx` file, then archived the old primitives under `docs/archive/legacy-ui-primitives/`.
- Trimmed the frontend dependency list to the libraries that are still needed by the working application, reducing package noise and making the stack easier to explain.
- Added repo-local VS Code settings to hide `__pycache__`, `*.pyc`, `node_modules`, `dist`, and the backend virtual environment from normal file browsing.
- Simplified the toast wrapper so it no longer depends on theme plumbing that the project was not otherwise using.

## Suggested ongoing log format
For each iteration, record:
- what changed
- why it changed
- what issue it solved
- whether more work is still needed
