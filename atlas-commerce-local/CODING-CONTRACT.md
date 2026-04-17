# Coding contract for the desktop-local ecommerce prototype

## Core expectation from Architect
The code should be:
- fully structured
- layered correctly
- modular
- readable
- low-redundancy
- built with proper functions, variables, and shared logic placement

This project should not become a messy prototype with repeated blocks and random logic placement.

## Architecture style
Use a clear layered structure:

### 1. App layer
Each domain stays inside its app:
- `users`
- `products`
- `cart`
- `orders`
- `dashboard`
- `common`

### 2. View layer
Views should stay thin.
They should:
- receive request data
- call the right service logic
- return response objects

Views should **not** hold large business rules.

### 3. Service layer
Put business logic in service-style modules when it improves clarity.
Examples:
- cart total calculation
- stock validation
- order placement flow
- dashboard aggregation
- reusable account logic

### 4. Model layer
Models hold data structure and model-specific logic only where it naturally belongs.
Do not force all business logic into models if it makes them bloated.

### 5. Common/shared layer
Put reusable shared code in `common` only when it is truly reused or clearly central.
Examples:
- response helpers
- validators
- constants
- formatting helpers
- reusable utility helpers
- shared service helpers

## Redundancy rule
Avoid repeating the same logic in multiple files.
If logic is reused across modules, move it into a shared helper or service.
If logic is only used once and is local in meaning, keep it local.

## Global vs local function rule
### Keep a function local when:
- it is only used inside one module
- moving it out would make the code harder to follow
- it is tightly tied to one page/view/service

### Move a function into shared/common code when:
- it is reused in multiple modules
- it represents a stable shared rule
- it reduces duplication and confusion
- it improves consistency across the project

## Variable and function naming rule
Use names that are:
- explicit
- readable
- domain-correct
- not vague

Prefer:
- `cart_items`
- `order_total`
- `validate_checkout_payload()`
- `build_dashboard_summary()`
- `get_product_by_slug()`

Avoid vague names like:
- `data`
- `info`
- `temp`
- `handleThing()`
- `x`
- `obj`

## Module organization rule
Within each app, prefer structure that stays easy to scan.
Example direction:

```text
apps/products/
  models.py
  views.py
  urls.py
  services.py
  validators.py
```

If an app grows, split carefully, but do not over-engineer too early.

## Common code rule
Use shared/common modules for things that are genuinely cross-cutting.
Do not dump unrelated helpers into one junk drawer file.
Organize common code by purpose.

Example direction:

```text
apps/common/
  responses.py
  validators.py
  constants.py
  utils.py
```

## Frontend rule
Frontend code should also be modular and non-redundant.
Use:
- reusable API client helpers
- reusable UI/state helpers where appropriate
- domain-grouped modules
- clear variable/function naming

Do not scatter repeated fetch logic across pages if one shared client/helper makes it cleaner.

## Simplicity rule
This is a prototype, but simplicity does not mean sloppy.
It means:
- fewer moving parts
- clearer code
- less abstraction noise
- good structure with minimal complexity

## Canonical implementation behavior
Atlas and Zeus should both implement using these standards:
- thin views
- shared reusable logic only where justified
- local helpers where local scope is enough
- services for business flows
- low duplication
- readable names
- modular app boundaries
- portable local project structure
