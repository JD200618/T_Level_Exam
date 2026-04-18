# Testing log

Use this file to record iterative testing during development.

| Date | Area tested | Method | Result | Change needed |
| --- | --- | --- | --- | --- |
| 2026-04-17 | Backend health endpoint | Manual request | Passed | None |
| 2026-04-17 | Customer login | Manual API and UI flow | Passed in current prototype flow | Review validation and edge cases |
| 2026-04-17 | Product listing | API and frontend rendering check | Passed | None |
| 2026-04-17 | Cart add/update/remove foundation | API and UI flow | Passed at prototype level | Continue edge-case testing |
| 2026-04-17 | Checkout preview and place order | API flow review | Passed at prototype level | Continue delivery/collection refinement |
| 2026-04-17 | Customer order history | API flow review | Passed | None |
| 2026-04-17 | Admin overview, inventory, orders, customers, analytics | API flow review | Passed at prototype level | Continue role and usability review |
| 2026-04-17 | Frontend production build | Vite production build | Passed | None |
| 2026-04-18 | Producer information pages and navigation | Frontend route and content review | Passed in build-validated prototype | Continue desktop click-through review |
| 2026-04-18 | Dashboard inventory editor | Shared API payload and product-edit UI review | Passed in build-validated prototype | Continue browser-side interaction review |
| 2026-04-18 | Frontend production build after GLH feature pass | Vite production build | Passed | Bundle is still large and could be split later |
| 2026-04-18 | Account management forms | Frontend state and API wiring review | Passed in build-validated prototype | Continue desktop interaction review |
| 2026-04-18 | Layered backend integration verification | `python3 manage.py test apps.common.tests -v 2` | Passed | Covers customer profile, addresses, payment methods, cart, checkout, order history, admin inventory, admin order status, analytics, and access control |
| 2026-04-18 | Frontend login credential alignment | Static review and seeded credential cross-check | Passed after correction | Re-test on desktop after pulling changes |
| 2026-04-18 | Checkout fulfilment flow | Code review of frontend and backend contract | Passed in code | Re-test with migrate + seed on desktop |
| 2026-04-18 | Producer metadata and expanded catalogue | Seed review plus frontend mapping check | Passed in code | Re-seed local database to load new catalogue rows |
| 2026-04-18 | Producer inventory editing surface | Code review of dashboard editor and API payloads | Passed in code | Manual UI verification needed after pull |
| 2026-04-18 | Frontend production build | Vite production build | Pending local run in this iteration | Execute after edits |

## Future testing areas
- accessibility and keyboard navigation
- mobile layout behaviour
- form validation edge cases
- scheduling and tracking behaviour across repeated order-status changes
- error handling and recovery states
