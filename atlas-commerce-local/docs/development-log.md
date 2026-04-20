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
- Removed the live routes for system architecture, data dictionary, and flowchart pages so they no longer add clutter to the runtime app or the tracked deliverable repo.
- Removed a large set of unused UI-kit component files so the active `src/app/components/ui` folder now matches the parts the app actually uses.
- Replaced the older split-out button/card/input/label/textarea/badge wrappers with a simpler shared `src/app/components/ui/core.tsx` file, then removed the old primitive copies from the tracked deliverable repo.
- Removed the unused `components/figma/ImageWithFallback.tsx` helper from the active frontend and removed its old reference copy from the tracked deliverable repo.
- Removed leftover Next.js-style `"use client"` directives from the active frontend UI primitives and cleaned a small duplicate class in `tabs.tsx` to keep the local React code simpler.
- Updated the demo seed command to stay quiet when run with `verbosity=0`, which keeps automated tests cleaner without changing functionality.
- Documented the chosen portability direction in `docs/local-portability-path.md`: keep the real local frontend/backend/database structure, but reduce user effort with bootstrap/start scripts rather than pretending the runtime does not exist.
- Added a Windows-first `scripts/bootstrap-local.cmd` and tightened the existing start scripts so a new desktop can be prepared with fewer manual steps.
- Expanded the portability documentation to explain why runtime/generated folders and machine-local support files exist, what should stay out of git, and which languages are used across the backend, frontend, and database layers.
- Added explicit maintainability guardrails to keep future code changes from drifting toward overly polished, tutorial-style, or obviously AI-generated patterns.
- Started an `Operation_Reconstruct` pass by giving the frontend a proper local TypeScript setup, fixing the main entry import for type-checking, moving `react` and `react-dom` into normal app dependencies, and replacing the loosest dashboard `any` usage with direct domain types.
- Continued the reconstruction pass by tightening `frontend/src/app/lib/api.ts` with practical raw response shapes instead of vague `any` values, keeping the live data flow more direct and easier to follow without changing the visible app behaviour.
- Simplified the account page by replacing long inline delete handlers and repeated form-reset chunks with small practical local helpers, keeping the code chunky and readable without adding a new abstraction layer.
- Simplified the checkout page by removing an unnecessary memo layer, tightening the local checkout state typing, and making the fulfilment-window flow more direct.
- Simplified the shop page by dropping an unnecessary memo, reducing repeated search normalization work, and making the product filter flow more direct.
- Simplified the dashboard overview by typing the main admin state directly and replacing a few presentation-oriented memo layers with straightforward derived values.
- Simplified the shared product card by removing a hardcoded seasonal badge that was not really driven by live data and tightening the component imports/click handler.
- Simplified the shared header by replacing repeated desktop/mobile route markup with one practical nav list and a small active-path helper.
- Simplified the home page by pulling static benefit data and producer-highlight logic out of the render body and dropping unnecessary memo layers.
- Simplified the shared dashboard layout by moving static nav configuration out of the component body and removing a few unnecessary optional checks after the admin/user guard.
- Simplified the login and admin-login pages by moving their shared page shell into a small reusable frame while keeping each form's auth behavior local to the page.
- Simplified the producers page by pulling static benefit data out of the component body, dropping an unnecessary memo layer, and making its simple stock summary more direct.
- Simplified the shop page by moving category-building and catalogue filtering into small file-local helpers, keeping the visible catalogue flow the same while trimming logic weight from the component body.
- Simplified the cart page by moving the bulky cart item row markup into one small file-local component while keeping cart state, totals, and checkout behavior unchanged.
- Trimmed the frontend dependency list to the libraries that are still needed by the working application, reducing package noise and making the stack easier to explain.
- Added repo-local VS Code settings to hide `__pycache__`, `*.pyc`, `node_modules`, `dist`, and the backend virtual environment from normal file browsing.
- Simplified the toast wrapper so it no longer depends on theme plumbing that the project was not otherwise using.

## Suggested ongoing log format
For each iteration, record:
- what changed
- why it changed
- what issue it solved
- whether more work is still needed
