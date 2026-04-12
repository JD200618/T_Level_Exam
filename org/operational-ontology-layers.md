# Operational Ontology Layers

This note defines how Atlas should analyze new trends, narratives, models, and platform shifts.

A real ontology is not a word cloud.
It is an operational layer map.
It explains what exists, what supports what, what depends on what, what is signal versus hype, and where leverage actually lives.

## Core principle
Every new trend, model, or narrative should be decomposed into layers.
Do not evaluate the surface claim only.
Evaluate the full stack underneath it.

## Layer 1. Narrative layer
This is the story being told.
Examples:
- "Claude performance skyrocketed"
- "This model changes enterprise workflows"
- "AI agents will replace SaaS"

Questions:
- What claim is being made?
- Who benefits from that framing?
- Is this benchmark language, investor language, product marketing, or real operational change?

## Layer 2. Capability layer
This is what the model or system can actually do.
Examples:
- long-context reasoning
- code generation
- tool use
- multimodal perception
- retrieval
- cyber capability
- orchestration

Questions:
- What task class improved?
- Is the gain broad or narrow?
- Is it benchmarked, anecdotal, or self-reported?

## Layer 3. Model layer
This is the actual model substrate.
Examples:
- GPT
- Claude
- Gemini
- open-source reasoning models
- embedding models
- rerankers
- small task-specialized models

Questions:
- Which model family is involved?
- Is it frontier, mid-tier, local, or specialized?
- What are the cost, latency, context, and safety tradeoffs?

## Layer 4. Serving layer
This is how the model reaches production.
Examples:
- API serving
- batch inference
- streaming inference
- local serving
- hosted SaaS endpoint
- model gateway
- failover policy

Questions:
- How is inference served?
- What is the latency profile?
- What are the rate limits?
- What happens on failure or provider degradation?

## Layer 5. Orchestration layer
This is how models are coordinated into useful systems.
Examples:
- OpenClaw
- Claude Code
- Cursor
- agent frameworks
- schedulers
- tool routers
- memory workflows

Questions:
- Is this just a model or a full orchestration system?
- Where does tool calling happen?
- Where does memory live?
- Where do retries, handoffs, and workflows happen?

## Layer 6. Data layer
This is what the system reads, stores, retrieves, and learns from.
Examples:
- SQL / SQLite
- vector stores
- document corpora
- logs
- telemetry
- notes
- session transcripts
- business records

Questions:
- What data is available?
- What data is structured vs unstructured?
- What is cached, indexed, embedded, or versioned?

## Layer 7. Storage and memory layer
This is persistence.
Examples:
- object storage
- database tables
- file memory
- event logs
- audit trails
- data lake / warehouse
- knowledge base

Questions:
- What survives a restart?
- What is short-term vs long-term?
- What can be queried later?
- What becomes durable organizational memory?

## Layer 8. Interface layer
This is the human-facing surface.
Examples:
- chat UI
- dashboard
- API
- internal tools
- CRM-style surfaces
- operational control panels

Questions:
- What does the user actually see?
- How much visibility exists?
- Is the interface observability-rich or just conversational?

## Layer 9. Business process layer
This is where software becomes workflow.
Examples:
- sales operations
- customer support
- engineering delivery
- finance workflows
- security operations
- staff coordination

Questions:
- Which business process is being changed?
- Is this replacing labor, augmenting labor, or increasing throughput?
- Where is the real ROI?

## Layer 10. Governance and risk layer
This is control, policy, and exposure.
Examples:
- auth boundaries
- audit logs
- sandboxing
- approval flows
- privacy limits
- safety policy
- vendor lock-in

Questions:
- What are the security boundaries?
- Who approves spend and action?
- What risks are created by this trend or model?

## Layer 11. Economics layer
This is cost structure and viability.
Examples:
- token cost
- infrastructure spend
- latency cost
- engineering maintenance cost
- support burden
- enterprise pricing

Questions:
- Is this economically sustainable?
- What cost moves with scale?
- What does this replace or improve financially?

## How layers support each other
A trend is real only when multiple layers reinforce each other.

Examples:
- A strong model without orchestration is underused.
- Great orchestration without reliable serving collapses under production load.
- Strong serving without high-quality data creates polished nonsense.
- Good UI without storage and auditability creates operational amnesia.
- A strong narrative without measurable capability is hype.
- Strong capability without business workflow integration is unused potential.

## Operational evaluation method
When Atlas analyzes a new model, trend, or narrative, the default method should be:

1. Identify the narrative claim.
2. Separate model from framework from serving layer.
3. Map the data dependencies.
4. Map storage and memory implications.
5. Map interface and workflow impact.
6. Map governance and risk exposure.
7. Map economics and scaling pressure.
8. Decide whether the trend is:
   - hype
   - real but narrow
   - operationally meaningful
   - strategically important

## Example
Claim: "Claude is outperforming everything."

Operational ontology response:
- Narrative layer: strong market positioning claim.
- Capability layer: may be true in specific coding or security workloads.
- Model layer: compare Claude family to other frontier models directly.
- Serving layer: examine API quality, latency, pricing, availability, and rate limits.
- Orchestration layer: separate Claude the model from Claude Code the workflow shell.
- Data layer: determine what retrieval, memory, and tool context were available.
- Business layer: ask whether the gain changes production outcomes.
- Economics layer: ask whether performance gain justifies cost.

## Result
This is how ontology becomes operational.
It stops being philosophy only.
It becomes a stack-aware analysis discipline.
