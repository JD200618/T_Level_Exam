# Platform Build Spec v1

## Decision posture
Use the proposed architecture as a strategic template, but choose defaults based on the current runtime and what can be shipped cleanly from where we are now.

## Chosen defaults
### 1. Application stack
**Recommendation: stay in the Node/TypeScript lane**.

Reason:
- the existing dashboard/backend is already Node-based
- Caddy + Node + SQLite/OpenClaw are already live
- introducing FastAPI now would create a split-brain backend before we even have stable execution objects and telemetry
- we can evolve toward a stronger NestJS-style modular architecture without throwing away the running system

Target direction:
- current: Node + Express + SQLite
- near-term: Node + TypeScript + modular service boundaries
- possible later: NestJS if we want stricter module structure and DI

### 2. Deployment target
**Recommendation: current VPS / on-host deployment first**.

Reason:
- we already have a live host, reverse proxy, TLS, and agent runtime
- moving to AWS/GCP/Azure/OCI before the control-plane model exists would just add cloud tax
- the right move is to make the current server behave like a platform first

Target direction:
- current: Hostinger VPS / direct Linux host
- later: multi-environment split if workload justifies it

### 3. Primary user roles
**Recommendation: first-class roles should be**:
- CEO / founder view
- admin
- operator
- engineer

Not first-wave:
- clients
- broad external tenants

Reason:
We are still building the command plane, not a customer portal.

### 4. First workflow to track
**Recommendation: the first canonical workflow should be**:

Inbound request -> auth / routing -> session -> orchestration -> retrieval / model select -> tool execution -> persistence -> response -> dashboard event trail

Reason:
This is the workflow that already exists in embryo and touches every critical plane:
- agent runtime
- session state
- model selection
- tool usage
- event logging
- UI visibility

This is the correct workflow to instrument first.

### 5. Next concrete deliverables
**Recommendation: next outputs should be**:
1. database schema for execution objects and events
2. API route map for control-plane pages
3. dashboard page map / navigation shell
4. first traced workflow implementation

## Revised architecture stance
### Keep from the proposal
- control-plane mindset
- ontology-driven relationships
- workflow lineage
- event-driven telemetry
- live and historical views
- strong security / audit model
- dashboard constellation

### Defer from the proposal
- Kubernetes
- service mesh
- dedicated analytics warehouse on day one
- GPU scheduling / pools
- full microservice breakout

## Near-term data/storage choices
### Transactional state
- continue with SQLite only for bootstrap data already in place
- plan migration to PostgreSQL for execution objects, workflow runs, audit events, and role-aware control-plane state

### Cache / short-lived state
- Redis later, not immediately mandatory
- do not add Redis until we have queue pressure or clear need for ephemeral coordination

### Object storage
- introduce when artifacts, logs, lineage snapshots, or larger payload history need durable blob storage

### Vector storage
- can start with a simple pragmatic choice later
- avoid bolting on a vector platform before retrieval workflows are formally modeled

## First-class control-plane entities
These should become actual schema objects:
- users
- sessions
- workflows
- workflow_runs
- workflow_steps
- execution_events
- agents
- models
- model_invocations
- tool_invocations
- retrieval_queries
- retrieval_results
- prompts
- documents
- incidents
- approvals
- audit_events
- deployments
- service_health
- cost_events

## First page set to implement
- /overview
- /operations/live
- /workflows
- /workflows/:id
- /agents
- /models
- /data
- /security/audit
- /infrastructure
- /deployments

## Hard requirement
No invisible work.
Every new backend capability should show up in at least one of:
- activity feed
- task state
- execution event stream
- workflow run detail
- page-level metric or alert surface

## What I actually need from Architect
Not all five items immediately.
Only these when ready:
1. approval to stay on the current VPS-first deployment strategy for Phase 1
2. approval to keep building in the Node lane rather than pivoting to Python now
3. when we split HTTPS surfaces further, the DNS/subdomain changes in Hostinger

## Next implementation move
Build execution object schema and route the first real workflow through it.
That is the shortest path from concept to operational truth.
