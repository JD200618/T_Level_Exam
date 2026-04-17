# Zeus code structure brief

## Additional requirement
Architect explicitly wants to see a **full programming structure layered correctly**, not just a folder shell.
This means Zeus should reason and advise with real code architecture discipline.

## What Zeus must optimize for
The codebase should be:
- layered properly
- modular
- simple
- readable
- low-redundancy
- clear in naming
- clear in function responsibility
- structured so future growth does not turn it into spaghetti

## Libraries
Zeus should assume a lean but proper library set:
- Django
- Django REST Framework
- django-cors-headers
- SQLite for prototype persistence

Do not recommend unnecessary infra or libraries unless there is a real need.
Avoid bloat.

## Required code layers
Zeus should explicitly think in these layers:

1. **Config layer**
   - settings
   - URLs
   - environment handling
   - runtime configuration

2. **Domain/app layer**
   - users
   - products
   - cart
   - orders
   - dashboard

3. **Model layer**
   - Django models
   - schema and relations

4. **Serializer / DTO layer**
   - request/response shaping
   - validation where appropriate

5. **View / endpoint layer**
   - thin views
   - routing
   - API entry points

6. **Service layer**
   - business logic
   - workflow logic
   - orchestration between models and views

7. **Shared/common layer**
   - reusable helpers
   - common response builders
   - validators
   - constants
   - formatting helpers

## Function discipline
Architect specifically wants proper handling of:
- global/shared functions
- local functions
- variable organization
- avoidance of redundant code

Translate that as follows:

### Shared/global reusable logic
Put shared reusable functions in common modules only when they are truly reused across modules.
Examples:
- response helpers
- error helpers
- validation helpers
- formatting helpers
- code generators
- common query helpers

### Local functions
Keep functions local when they only support one module or one service.
Do not promote everything to shared/global scope.

### Variables
- use descriptive names
- avoid vague one-letter variables except in trivial loops
- keep scope tight
- avoid hidden mutable global state
- keep configuration variables centralized

### Redundancy rule
If logic repeats across multiple modules, extract it.
If logic is only used in one place, keep it local.
Do not over-abstract prematurely.

## Module-level expectations
Zeus should align future guidance with module-level files such as:
- `models.py`
- `views.py`
- `serializers.py`
- `services.py`
- `urls.py`
- `validators.py` when needed
- `permissions.py` when needed
- `tests.py`

## Service-layer expectations
Architect wants real structure, not logic sprayed into views.
Zeus should therefore prefer:
- thin views
- business logic in service functions/classes where useful
- clear boundary between transport and business logic

Examples of desired service structure:
- `users/services.py`
- `products/services.py`
- `cart/services.py`
- `orders/services.py`
- `dashboard/services.py`

## Common/shared module expectations
Zeus should explicitly encourage a common module for things like:
- `responses.py`
- `utils.py`
- `validators.py`
- `constants.py`
- `exceptions.py`

But should also avoid making `common` a junk drawer.

## Path and runtime alignment
All code guidance should still remain aligned to:
- desktop-local runtime
- local path at `C:\Projects\ecommerce-prototype\`
- Django + Python + SQLite
- existing frontend
- Node.js only for frontend tooling

## What Zeus should do now
In future guidance, Zeus should:
- describe the codebase as a real layered architecture
- reinforce good module boundaries
- reinforce correct use of shared vs local functions
- reinforce proper naming and structure
- explicitly avoid redundant code and chaotic file sprawl
- help turn the scaffold into a disciplined codebase, not just a demo shell
