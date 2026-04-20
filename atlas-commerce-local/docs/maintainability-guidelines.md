# Maintainability guidelines

## Goal
The codebase should remain understandable, modular, and maintainable by a third-party developer.

## Structural rules
- keep clear domain boundaries
- keep views and endpoints thin
- place business logic in service modules where reuse or clarity justifies it
- keep models focused on data structure and natural model behaviour
- use shared helpers only when logic is truly reused

## Shared vs local logic
### Shared logic should be used when:
- the same rule appears in multiple modules
- the same data transformation is reused across the project
- the shared function improves consistency and lowers duplication

### Local logic should stay local when:
- it is only used in one module or component
- extracting it would make the code harder to follow
- it is specific to a page, service, or small flow

## Naming expectations
Use names that are:
- explicit
- domain-correct
- easy to understand later

Avoid vague names where a more meaningful name is possible.

## Frontend guidance
- keep shared API logic in shared client files
- keep component-specific handlers inside the relevant component unless reuse is justified
- avoid repeated fetch logic across multiple pages when a shared helper is cleaner
- prefer straightforward pages over large showcase-style component systems
- remove or archive unused UI files instead of leaving generated component kits in the active app
- keep the visible dependency stack small enough that a new developer can explain why each package exists

## Human-coded style guardrails
The goal is readable, believable project code, not tutorial-perfect code.

### Avoid
- heavy comments or docstrings for obvious code
- variable names that are so long they become awkward to scan
- abstraction layers added only to look clean rather than solve a real problem
- splitting every small action into a perfectly balanced helper when local page logic is easier to follow
- over-polished defensive code for tiny flows that do not need it

### Prefer
- short, meaningful names that still match the domain
- practical page-level logic when the feature is small and local
- service helpers only when the logic is reused or clearly benefits from separation
- straightforward control flow that a student can explain line by line
- normal trade-offs and a little natural unevenness where real projects are usually uneven

## Backend guidance
- keep request transport handling in views or endpoints
- keep workflow and business rules in service files
- keep cross-cutting response helpers in a shared common layer
- avoid unnecessary abstraction and avoid dumping unrelated helpers into one file

## Outcome
The project should stay simple, readable, and easy to hand over.
