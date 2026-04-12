# AI Platform Architecture Review

## Summary judgment
The six-plane model is directionally correct as a **target operating model**.
It is much closer to a real AI operations platform than a chat wrapper.

However, parts of it are **future-state platform architecture**, not day-one build architecture.
If we try to instantiate the full target stack immediately, we will create orchestration theater and infra drag before we have enough workload, telemetry volume, or operator demand to justify it.

So the right move is:
- accept the six-plane ontology
- reject premature infra complexity
- build a staged control-plane platform

## What is correct in the proposed model
### 1. Operational AI platform, not chat wrapper
Correct.
The system should be built as an operational platform with:
- execution objects
- event history
- control surfaces
- drill-downs
- attribution
- governance
- replayability

### 2. Every request becomes a tracked execution object
Correct.
This is the most important architectural statement in the proposal.
Every request should become an execution artifact with:
- request metadata
- actor
- workflow state
- model/tool path
- latency
- cost
- policy result
- output result

### 3. Dashboard constellation, not one page
Correct.
Different operator roles need different views:
- executive command
- control tower
- workflow lineage
- infra/runtime
- governance/audit
- model/data surfaces

### 4. Closed-loop operations
Correct.
Insight -> action -> logging -> replay -> improvement.
That loop is the right primitive.

## What is overbuilt right now
### 1. Service mesh
Not yet.
This is unnecessary until the runtime is materially split into multiple networked services under real operational pressure.
Right now it adds control-plane complexity without enough service topology to justify it.

### 2. Kubernetes
Not yet.
A useful target later, but premature today.
Current scale is better served by:
- systemd
- Caddy
- Node services
- explicit workers
- process-level observability

### 3. Analytics warehouse / feature store
Not yet as a mandatory first step.
We do need structured events and analytics-ready data, but not necessarily a dedicated warehouse or feature store at bootstrap stage.
First we need a clean event model.
Then we can decide if volume or analytical demand justifies a warehouse.

### 4. GPU pools
Not yet.
Only necessary if we host local inference or embedding workloads at meaningful scale.
At current stage, the serving path is API-backed.

## What must be added immediately
### 1. Execution model
We need a canonical execution schema.
Suggested top-level entities:
- execution_runs
- execution_events
- workflow_defs
- workflow_steps
- policy_decisions
- model_selections
- tool_calls
- outputs
- alerts

### 2. Trace model
We do not need full OpenTelemetry everywhere on day one, but we do need OTEL-like primitives:
- trace_id
- span_id
- parent_span_id
- workflow_id
- actor_id
- model_id
- service_name
- latency_ms
- status

### 3. Event-first control plane
Every meaningful transition must emit an event.
This can begin with:
- SQL event tables
- websocket fanout to dashboard
- append-only event records

We do not need Kafka before we need Kafka.

### 4. Role-based pages
The current dashboard must evolve into page-level surfaces.
At minimum:
- executive overview
- live operations
- workflows / lineage
- agents / model registry
- data / memory
- infra / runtime
- governance / audit

## Recommended staged platform architecture
## Stage 0: current bootstrap runtime
Current state is effectively:
- OpenClaw gateway
- agent workspaces
- file memory
- Node dashboard backend
- SQLite app state
- Caddy reverse proxy
- systemd service orchestration

This is enough to bootstrap a control plane.

## Stage 1: control-plane monolith with strong telemetry
Goal:
keep one application boundary, but make it observable.

Add:
- execution_runs table
- execution_events table
- structured event taxonomy
- per-run drill-down
- page-level navigation
- alert / retry surfaces
- workflow queue visibility

This is the correct next stage.

## Stage 2: logical service separation
Split the monolith by concern, even if still deployed together.
Logical modules:
- session service
- orchestration service
- model/router service
- retrieval service
- notification service
- audit/event service

Keep deployment simple.
Do not force network microservices too early.

## Stage 3: externalized production services
Only after operational pressure justifies it, externalize:
- Postgres for OLTP
- Redis for cache / queue acceleration
- vector DB or pgvector
- object storage for artifacts
- warehouse / lake for analytical history
- dedicated worker fleet

## Stage 4: platform-grade infra
Only later, if justified:
- Kubernetes
- service mesh
- deeper policy and zero-trust layers
- richer SLO instrumentation
- cost telemetry by service / workflow / tenant

## Needed ontology correction
A true ontology for this platform is not only infra planes.
We also need **domain entities**.
Suggested entity model:
- Agent
- Model Endpoint
- Workflow
- Execution Run
- Task
- Incident
- Policy Decision
- Dataset
- Memory Source
- Channel
- Deployment
- Operator
- Alert

These entities must have relationships.
That is what makes the system Palantir-like rather than just dashboard-heavy.

## Recommended canonical execution path
Input -> API Gateway -> Auth -> Session -> Orchestrator -> Policy -> Retrieval -> Model Router -> Inference / Tooling -> Post-Processing -> Persistence -> Event Emit -> Dashboard / Notification

This is correct.

But implementation detail matters:
- do not start with a distributed bus if SQL append-only events are enough
- do not start with microservices if modules inside one deployable are enough
- keep the path instrumented from day one

## What the dashboard should eventually show
### Executive command dashboard
- health score
- active workflows
- failure rate
- latency
- cost burn
- infrastructure saturation
- policy blocks

### Operations control tower
- live stream
- queue depth
- retries
- failures
- dependency health
- deployment status

### Workflow lineage dashboard
- trace tree
- step timings
- model path
- retrieval path
- tool path
- policy decisions
- final output

### Agent and model page
- route bindings
- current model
- fallback model
- utilization
- costs
- error rate
- model switch history

### Data and memory page
- source inventory
- embeddings/index status
- memory promotions
- stale data warnings
- lineage from source -> retrieval -> output

### Governance and audit page
- actor activity
- approvals
- policy blocks
- sensitive action trail
- auth and routing changes

## Bottom line
The proposal is strong as a strategic architecture.
But the build should be:
- event-first
- page-oriented
- SQL-backed at first
- modular before microservice
- systemd/Caddy before Kubernetes/service mesh
- operationally traceable from day one

That is how we make it real instead of decorative.
