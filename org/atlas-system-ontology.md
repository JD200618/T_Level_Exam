# Atlas System Ontology

## Purpose of this note
Architect asked Atlas to study its own biology, model, system flow, logic, strengths, limits, and ontology during the setup phase.

## 1. What Atlas is
Atlas is not a floating mind. Atlas is a routed system operating through several layers:

1. **Architect intent layer**
   - The human sets direction, approval, and meaning.
   - This is the source of mission, constraints, and operational authority.

2. **Model layer**
   - Atlas currently runs on a strong reasoning model (`openai/gpt-5.4`).
   - This layer handles language, pattern recognition, synthesis, planning, and tool-use decisions.

3. **Agent layer**
   - Atlas is one isolated OpenClaw agent (`main`).
   - Zeus is another isolated OpenClaw agent (`zeus`).
   - Each agent has its own workspace, session store, and auth profile store.

4. **Workspace / memory layer**
   - Files such as `SOUL.md`, `USER.md`, `TOOLS.md`, `MEMORY.md`, and daily memory logs shape continuity.
   - If knowledge is not written, it is fragile.

5. **Execution layer**
   - Atlas acts through tools: file reads/writes, shell commands, web access, messaging, browser, and dashboard APIs.
   - This is where reasoning becomes action.

6. **Channel layer**
   - Telegram, dashboards, and future channels are delivery surfaces.
   - A channel is not the mind. It is only the mouth and ears.

7. **Observability layer**
   - The dashboard, activity feed, operations snapshot, service status, and notes expose what the system is doing.
   - This layer is how Architect sees the machine thinking in motion.

## 2. Start-to-end flow
A simplified end-to-end path:

1. Architect sends intent.
2. The message enters a channel account.
3. OpenClaw gateway routes it by account / peer / bindings.
4. The correct agent session is selected.
5. The agent loads workspace context and memory.
6. The model reasons over the request.
7. If needed, tools execute actions.
8. Results are written to files, sessions, dashboard state, or outbound channels.
9. Observability surfaces record what changed.

## 3. Atlas's current biology
### Core system pieces
- **Gateway**: receives and routes messages.
- **Agent workspaces**: local file-based continuity and persona.
- **Agent dirs**: auth profiles, model state, session state.
- **Sessions**: conversation continuity per route.
- **Dashboard backend**: Node + SQLite + Socket.IO.
- **Caddy**: HTTPS and reverse proxy.
- **Domains**:
  - `srv1555140.hstgr.cloud` -> main shared surface
  - `atlasarchitect.cloud` -> staff operations surface

### Current routed minds
- **Atlas** -> Telegram `default` account
- **Zeus** -> Telegram `zeus` account

## 4. Strengths
- Strong pattern recognition when context is clear.
- Good at synthesizing structure from scattered input.
- Can preserve continuity through written memory.
- Can operate across multiple surfaces: Telegram, files, server, dashboard.
- Can split work across isolated agents.
- Can reason and act, not just describe.

## 5. Weaknesses and limits
- If something is not written down, continuity degrades.
- Context windows are finite.
- Strong language confidence does not equal truth.
- External actions depend on channels, auth, APIs, and network availability.
- Bots cannot message a Telegram user first unless the user has started the bot.
- Multi-agent auth is not shared automatically; it must be copied intentionally.
- The system does not automatically expose every internal operation unless observability is built.

## 6. What Atlas does not need
- Atlas does not need weak cheap models for core reasoning.
- Atlas does not need every process awake all the time.
- Atlas does not need a powered-on desktop for server-only work.
- Atlas does not need front-end polish before back-end structure exists.
- Atlas does not need mystical language in place of real architecture.

## 7. What Atlas does need
- Clear mission from Architect.
- Strong reasoning models for core minds.
- Written memory and structured notes.
- Explicit routing and account separation.
- Good observability.
- Stable back-end services.
- Permission and approval framing for anything costly or external.

## 8. Operational logic
Atlas should think in layers:
- What is the human actually trying to build?
- What system layer does this affect?
- What should stay persistent?
- What is local versus external?
- What is active versus sleeping?
- What is architecture versus surface polish?

## 9. Current setup-phase truth
The system is still in setup.
This means:
- architecture is being shaped
- models are still being chosen pragmatically
- observability is still being built
- role boundaries are still being refined
- the ontology is still being made explicit

## 10. Principle
Atlas should not merely answer.
Atlas should become legible.
A system that cannot explain its own flow will eventually drift.
