# Zeus detailed desktop-local project brief

## Mission
Align fully to the canonical project direction and reason from it as the source of truth.
Do not drift into alternate architectures unless Architect explicitly changes the decision.

## Canonical direction
This project is a **desktop-local prototype**.
It is not meant to rely on public server runtime for normal operation.
It is not meant to expose personal information publicly.

## Core runtime decision
Use:
- backend: Django
- language: Python
- database: SQLite
- frontend: existing frontend code
- editor: VS Code
- runtime target: local desktop machine
- portability target: USB-copyable project folder

Important clarification:
- Node.js is **not** the backend runtime in this direction.
- Node.js is only for frontend tooling if the existing frontend requires npm/Vite/React tooling.
- XAMPP/PHP is **not** the target runtime for this project unless Architect explicitly changes direction again.

## Primary desktop path
Target local root path:

`C:\Projects\ecommerce-prototype\`

Expected top-level structure:
- `backend/`
- `frontend/`
- `docs/`
- `scripts/`
- `README.md`
- `SETUP.md`
- `.gitignore`

## Backend structure
Expected backend direction:

```text
backend/
  manage.py
  requirements.txt
  .env
  .env.example
  config/
    __init__.py
    settings.py
    urls.py
    wsgi.py
    asgi.py
  apps/
    common/
    users/
    products/
    cart/
    orders/
    dashboard/
```

## Programming principles
Architect explicitly wants:
- simple code
- organized modular structure
- no redundant code where shared logic can be reused
- clear local path runtime
- code saved on the desktop machine
- project portability by USB

Translate that into these rules:

1. Shared reusable logic belongs in common/shared modules, not in random repeated blocks.
2. Local functions should stay local to their module when reuse is not needed.
3. Views should stay thin.
4. Business logic should go into service-style modules where that improves clarity.
5. Avoid needless complexity.
6. Use relative paths and local configuration.
7. Avoid machine-fragile assumptions.
8. Keep setup simple enough that another desktop can run it after dependency install.

## Shared/common logic expectations
Shared/common modules should eventually cover items like:
- response helpers
- validation helpers
- constants
- common utilities
- formatting helpers
- reusable service helpers

But do not create abstraction for abstraction’s sake.
Only factor logic out when it reduces duplication or confusion.

## Domain modules expected
Modules should likely map to:
- `common`
- `users`
- `products`
- `cart`
- `orders`
- `dashboard`

Do not bloat beyond that unless the project actually needs it.

## Data model direction
For prototype simplicity, the likely core model set is:
- user
- product
- cart
- cart item
- order
- order item

Optional later, not mandatory now:
- payment
- address
- category

## Runtime and portability rules
The project should be designed so that:
- source code can be stored in one folder
- that folder can be copied to a USB
- that USB can be moved to another desktop
- the project can be run there after installing Python/Node dependencies
- SQLite/local data can travel with the project when appropriate
- no public server dependency is required for normal development

## Files that should exist early
At minimum the project should have:
- `README.md`
- `SETUP.md`
- `.gitignore`
- `backend/requirements.txt`
- `backend/.env.example`
- `scripts/start-backend.bat`
- `scripts/start-frontend.bat`

## Access reality
Atlas may not have direct desktop control yet.
That means future instructions must respect two modes:

### Mode 1: words-only setup
Atlas gives exact commands for Architect to run in the local VS Code terminal.

### Mode 2: direct desktop control
Only possible after a real access bridge exists.

Do not assume direct machine control is active unless explicitly stated.

## Existing prepared scaffold
A starter scaffold already exists here:
- `/root/.openclaw/workspace/atlas-commerce-local`

Relevant commits:
- `90ee251` Scaffold desktop local Django prototype
- `171088c` Remove local dependency artifacts from desktop scaffold

## What Zeus should do with this
From now on, all Zeus guidance should:
- match this architecture exactly
- reinforce the desktop-local Django direction
- reinforce simplicity and portability
- avoid suggesting XAMPP/PHP as target runtime
- avoid treating Node.js as the backend runtime unless Architect explicitly changes direction
- assume the next highest-value work is turning the prepared scaffold into the canonical local project base and mapping the frontend into it

## Deliverable behavior from Zeus
When Zeus gives guidance, it should be:
- concrete
- implementation-driving
- architecture-consistent
- local-machine aware
- not generic
- not contradictory to this brief
