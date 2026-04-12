# Control-Plane Dashboard Brief

## Goal
Build a functional operator surface for Architect, Atlas, Zeus, and future staff models.
This should behave more like an infrastructure control plane than a chat page.

## Research signals
### Palantir Foundry Control Panel
Key pattern:
- centralized admin surface
- all administrative workflows in one control panel
- side navigation grouped by scope
- search-first setting discovery

Implication for us:
- one operator shell with clear left-nav / top-nav
- settings and actions grouped by layer, not by random widget sprawl
- search and quick actions should exist early

### Oracle Cloud Observability and Management
Key pattern:
- full-stack visibility
- asset relationships
- fleet monitoring
- tracing
- server monitoring
- automation from the same surface

Implication for us:
- dashboard must show relationships, not just boxes
- metrics + health + logs + jobs must reinforce each other
- event streams, alarms, and fleet-wide state should be first-class

### Microsoft Foundry Control Plane
Key pattern:
- unified visibility, governance, and control for AI agents, models, and tools
- from build to production

Implication for us:
- agent fleet management is not optional
- models, tools, memory, and approvals need governance surfaces
- the control plane must span build, run, audit, and policy

## Product direction
We are not building a generic chat dashboard.
We are building an **AI operations control plane**.

This means:
- agent fleet view
- runtime state
- model registry
- data and memory surfaces
- event logs
- task and execution tracking
- deployment / endpoint visibility
- input and output routing
- approvals / governance

## Recommended page architecture
### 1. Command Center
Purpose:
- top-level operating picture
- active focus
- current incidents
- live fleet state
- progress and alerts

Widgets:
- global status row
- active operation timeline
- top blockers
- recent changes
- quick actions

### 2. Agents / Fleet
Purpose:
- manage Atlas, Zeus, and future models as a fleet

Widgets:
- agent registry
- runtime status
- model in use
- heartbeat
- route bindings
- wake/sleep/off controls
- current task ownership

### 3. Runtime / Infrastructure
Purpose:
- see the serving stack and infra topology

Widgets:
- gateway status
- proxy status
- HTTPS endpoints
- Node services
- systemd units
- latency / availability / restart events
- bandwidth or traffic summaries later

### 4. Data / Memory
Purpose:
- inspect what the system knows and what it is loading

Widgets:
- memory sources
- file-backed context sources
- session stores
- vector/FTS status
- ontology notes
- study notes
- promotion pipeline from raw note -> memory -> doctrine

### 5. Inputs / Outputs
Purpose:
- map what enters and leaves the system

Widgets:
- inbound channels
- outbound channels
- API inputs
- task/job inputs
- dashboard/operator inputs
- note/task/message outputs
- notification outputs
- future webhook or API endpoints

### 6. Workflows / Execution
Purpose:
- translate ideas into active work

Widgets:
- task boards
- layered backlog
- execution state
- dependencies
- handoffs
- approvals waiting
- done history

### 7. Observability / Events
Purpose:
- make operations inspectable

Widgets:
- event stream
- audit log
- operation timeline
- service incidents
- model switches
- task state transitions
- routing changes

### 8. Governance / Admin
Purpose:
- protect the system and control change

Widgets:
- users and roles
- permissions
- auth/account bindings
- policy controls
- approval rules
- domain / proxy / HTTPS mappings

## Layer model for the dashboard
The dashboard itself should mirror the ontology.

1. Narrative layer
   - why we are making a change
2. Capability layer
   - what improved or changed
3. Runtime layer
   - which services and endpoints are involved
4. Data layer
   - what sources feed the operation
5. Memory layer
   - what persists
6. Interface layer
   - where humans interact
7. Governance layer
   - what risks and permissions apply
8. Economics layer
   - what the cost and scaling impact are

## Technical design direction
### Frontend
- multi-page layout, not one long page forever
- role-oriented navigation
- searchable command palette later
- strong information hierarchy
- charts where they encode state, not decoration

### Backend
- Node service as current application layer
- SQLite okay for bootstrap stage
- event tables should expand into stronger audit/event models
- API endpoints should become page-specific data providers
- websocket / push state useful for live fleet visibility

### Proxy / routing
- Caddy remains reverse proxy and TLS termination layer
- add new HTTPS surfaces only when each surface has a distinct operational purpose
- likely future split:
  - main control plane
  - staff ops / build plane
  - possibly admin or API surface

### Storage
Current:
- SQLite for app state
- file-backed memory for context
- session stores inside OpenClaw agent dirs

Future:
- structured event storage
- optional analytics store / data lake style append-only logs if volume grows
- separate operational telemetry storage if we start capturing metrics at higher frequency

## Input / output architecture
### Inputs
- Telegram
- dashboard messages
- task creation
- note creation
- future webhooks / APIs
- operator commands

### Outputs
- messages
- notes
- task updates
- activity events
- alerts
- future API responses / external webhooks

## Build order
### Layer 1. Tracking foundation
- every meaningful operation creates an event
- active state always visible
- tasks and notes linked to work in progress

### Layer 2. Information architecture
- page model
- nav model
- top-level command center

### Layer 3. Fleet and runtime pages
- agent/fleet page
- runtime/infra page
- proxy/domain map

### Layer 4. Input/output surfaces
- I/O map
- routing ownership
- alerts and notifications

### Layer 5. Governance and scale
- approvals
- permissions
- better event retention
- more formal telemetry and analytics

## Immediate recommendation
Do not keep growing a single monolithic dashboard page forever.
Convert the current system into a **control-plane shell** with page-level navigation and stronger event modeling.
That is the correct next step.
