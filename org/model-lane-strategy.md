# Model Lane Strategy for the Atlas Ecosystem

## Purpose

Define which models should power which kinds of work in the Atlas ecosystem.

This is not a vanity leaderboard.
This is an operating policy for reasoning, programming, research, orchestration, and future scale.

## Design rule

Model choice should follow **task shape**, not hype.

The system needs different model lanes for:
- executive reasoning and orchestration
- backend and programming depth
- research and long-context synthesis
- lower-cost support work
- future self-hosted and batch infrastructure

## What the current model landscape suggests

From the current research pass, the practical pattern is:

### 1. GPT-5.4 is strong for orchestration and agent loops
Why it matters here:
- strong general reasoning
- good structured output behavior
- strong tool-calling and execution flow behavior
- good speed for interactive operator work
- strong fit for Atlas as lead/orchestrator

### 2. Claude Opus 4.6 is one of the best deep engineering and synthesis models
Why it matters here:
- excellent long-form reasoning
- strong multi-file coding and refactoring ability
- strong coherence across large technical contexts
- well suited for backend, systems, and difficult implementation work
- strong fit for Heracles

### 3. Claude Sonnet 4.6 is a cheaper engineering-value lane
Why it matters here:
- still strong for coding and technical tasks
- better cost profile than Opus
- useful for medium-depth engineering work where Opus is not necessary
- good candidate for scalable support engineering tasks

### 4. Gemini 3.1 Pro looks attractive for research and long-context price/performance
Why it matters here:
- strong coding and reasoning benchmarks
- strong price/performance claims in current comparisons
- attractive for long-context research and large corpus analysis
- likely useful as a future Zeus-side research lane if we add Google provider access

### 5. Open/self-hosted families still matter for scale, batch, and internal workloads
Practical candidates later:
- Qwen coder family
- DeepSeek coder / V3-class lanes
- MiniMax or similar frontier-adjacent open-weight options

Why they matter:
- cheap batch summarization
- local experimentation
- lower-risk internal automation
- cost control for support workloads

## Recommended lane map for this system

### Atlas
**Function:** Lead, orchestrator, control-plane intelligence, operator-facing reasoning

**Primary model:** `openai/gpt-5.4`
**Secondary escalation model:** `anthropic/claude-opus-4-6`

**Why:**
Atlas needs strong reasoning, clean execution behavior, and good tool-loop discipline. GPT-5.4 is a good operational default. When the work becomes deeply architectural, multi-layered, or hard to synthesize, Atlas should escalate to Opus rather than forcing everything through one lane.

### Zeus
**Function:** Research, narrative intake, external signal, trend synthesis

**Current primary model:** `openai/gpt-5.4`
**Future research lane target:** `gemini-3.1-pro` or equivalent Google frontier lane
**Secondary synthesis option:** `anthropic/claude-sonnet-4-6`

**Why:**
Zeus needs strong search synthesis, narrative compression, and large-context reading. GPT-5.4 is acceptable now. But the ideal future Zeus lane is a high-context, price-efficient research model. Gemini is attractive here if and when we bring it into the runtime.

### Heracles
**Function:** Backend, infrastructure, system mechanics, implementation depth

**Primary model:** `anthropic/claude-opus-4-6`
**Secondary execution/cost lane:** `anthropic/claude-sonnet-4-6`

**Why:**
Heracles should be the heavy engineering mind. Opus is the right premium lane for complex backend changes, runtime plumbing, deployment logic, and deep code reasoning. Sonnet is the right lower-cost companion lane for routine technical execution.

## Model classes the platform should support

### Class A: Command models
Used for:
- executive orchestration
- operator conversation
- task planning
- approvals
- integration decisions

Current best fit:
- GPT-5.4
- Claude Opus 4.6 as escalation path

### Class B: Builder models
Used for:
- backend implementation
- code generation
- refactoring
- runtime troubleshooting
- infrastructure design

Current best fit:
- Claude Opus 4.6
- Claude Sonnet 4.6
- future Gemini 3.1 Pro comparison lane

### Class C: Research models
Used for:
- long-context reading
- external market and company analysis
- literature / technical survey
- signal extraction
- narrative synthesis

Current best fit:
- GPT-5.4 now
- future Gemini lane likely strong here
- Claude Sonnet can support synthesis

### Class D: Worker models
Used for:
- low-risk support tasks
- tagging
- classification
- batch summarization
- draft expansion
- background processing

Future best fit:
- self-hosted or lower-cost open-weight models
- DeepSeek / Qwen / similar worker lanes

## System integration recommendation

### Right now
Already integrated and usable:
- Atlas on GPT-5.4
- Zeus on GPT-5.4
- Claude lane on Claude Sonnet 4.6
- Heracles on Claude Opus 4.6

This is already a valid high-quality core.

### Next practical integration step
Do not add random providers just to collect names.

Add models only when one of these is true:
1. they fill a missing lane
2. they materially improve cost/performance
3. they unlock a new capability such as long-context research or self-hosted batch execution

### Best next model to add
**Gemini frontier lane** for research and long-context comparative use, if Architect wants Google provider access added.

Why this is the next best addition:
- it complements, rather than duplicates, GPT and Claude
- it gives Zeus a differentiated research lane
- it helps on large corpus reading and cost-sensitive analysis

### After that
Add a **self-hosted worker lane** for low-cost background jobs, probably from:
- Qwen coder family
- DeepSeek family
- similar open-weight candidates once host capacity and serving design are ready

## Operating rules

1. Do not force one model to do every job.
2. Keep premium reasoning models on high-value decisions.
3. Use the backend lane for deep engineering, not casual chat.
4. Use research lanes for wide reading and synthesis, not final governance decisions by default.
5. Add open/self-hosted worker models only when we are ready to serve, monitor, and govern them properly.

## Concrete system policy

- **Atlas** leads with GPT-5.4, escalates to Opus for hard synthesis
- **Zeus** researches with GPT-5.4 now, later shifts part of the research lane to Gemini
- **Heracles** owns backend and systems work on Opus, with Sonnet as cost-controlled execution support
- **Future local worker models** should handle background classification, indexing, tagging, and batch enrichment

## Recommendation to Architect

The current stack is good enough to keep building now.

Best immediate operating setup:
- Atlas -> GPT-5.4
- Zeus -> GPT-5.4
- Heracles -> Claude Opus 4.6
- Claude support lane -> Claude Sonnet 4.6

Best next expansion:
- add a Google/Gemini provider lane for research and long-context comparative analysis

Best later expansion:
- add a self-hosted worker model lane for cheap background tasks

## Source signals used in this pass

- current comparison/search results around GPT-5.4, Claude Opus 4.6, Claude Sonnet 4.6, and Gemini 3.1 Pro
- coding comparison material indicating:
  - Opus is strong for reasoning depth and large codebases
  - GPT is strong for terminal/tool execution loops
  - Gemini is attractive on price/performance and long context
- platform/operator research indicating AI systems should be run as an operating layer with observability, evals, deployment discipline, and role clarity
