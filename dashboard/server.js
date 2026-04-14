const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { execSync } = require('child_process');
const express = require('express');
const http = require('http');
const Database = require('better-sqlite3');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = Number(process.env.PORT || 3210);
const APP_ROOT = __dirname;
const WORKSPACE_ROOT = path.resolve(APP_ROOT, '..');
const OPENCLAW_HOME = path.join(os.homedir(), '.openclaw');
const OPENCLAW_CONFIG_PATH = path.join(OPENCLAW_HOME, 'openclaw.json');
const PUBLIC_DIR = path.join(APP_ROOT, 'public');
const DATA_DIR = path.join(APP_ROOT, 'data');
const DB_PATH = path.join(DATA_DIR, 'pillar.db');
const CREDENTIALS_PATH = path.join(DATA_DIR, 'bootstrap-credentials.json');
const AGENT_RUNTIME_MAP = {
  atlas: {
    configId: 'main',
    sessionsDir: path.join(OPENCLAW_HOME, 'agents', 'main', 'sessions'),
  },
  zeus: {
    configId: 'zeus',
    sessionsDir: path.join(OPENCLAW_HOME, 'agents', 'zeus', 'sessions'),
  },
  heracles: {
    configId: 'heracles',
    sessionsDir: path.join(OPENCLAW_HOME, 'agents', 'heracles', 'sessions'),
  },
};

fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id TEXT NOT NULL,
    author TEXT NOT NULL,
    role TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (room_id) REFERENCES rooms(id)
  );

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    note_type TEXT NOT NULL DEFAULT 'update',
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'backlog',
    priority TEXT NOT NULL DEFAULT 'medium',
    room_id TEXT NOT NULL DEFAULT 'build',
    assignee_model_id TEXT,
    created_by TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS staff_state (
    model_id TEXT PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'asleep',
    clocked_in INTEGER NOT NULL DEFAULT 0,
    notes TEXT NOT NULL DEFAULT '',
    updated_at INTEGER NOT NULL,
    updated_by TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS operation_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    actor TEXT NOT NULL,
    status TEXT NOT NULL,
    focus TEXT NOT NULL,
    detail TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS activity_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor TEXT NOT NULL,
    kind TEXT NOT NULL,
    status TEXT NOT NULL,
    title TEXT NOT NULL,
    detail TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS execution_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trace_id TEXT NOT NULL UNIQUE,
    workflow_key TEXT NOT NULL,
    actor TEXT NOT NULL,
    status TEXT NOT NULL,
    input_ref TEXT NOT NULL DEFAULT '',
    output_ref TEXT NOT NULL DEFAULT '',
    started_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    completed_at INTEGER,
    latency_ms INTEGER
  );

  CREATE TABLE IF NOT EXISTS execution_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id INTEGER NOT NULL,
    step_key TEXT NOT NULL,
    step_label TEXT NOT NULL,
    service_name TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL,
    detail TEXT NOT NULL DEFAULT '',
    started_at INTEGER NOT NULL,
    completed_at INTEGER,
    latency_ms INTEGER,
    parent_step_id INTEGER,
    FOREIGN KEY (run_id) REFERENCES execution_runs(id)
  );

  CREATE TABLE IF NOT EXISTS execution_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id INTEGER NOT NULL,
    step_id INTEGER,
    event_type TEXT NOT NULL,
    status TEXT NOT NULL,
    detail TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL,
    FOREIGN KEY (run_id) REFERENCES execution_runs(id),
    FOREIGN KEY (step_id) REFERENCES execution_steps(id)
  );
`);

const defaultRooms = [
  { id: 'general', label: 'General', description: 'Shared channel for everyone.', sort_order: 1 },
  { id: 'architect', label: 'Architect', description: 'Direct line between Architect and Atlas.', sort_order: 2 },
  { id: 'ops', label: 'Ops', description: 'Infrastructure, hosting, approvals, and runtime state.', sort_order: 3 },
  { id: 'build', label: 'Build', description: 'Product, engineering, design, and delivery.', sort_order: 4 },
];

const upsertRoom = db.prepare(`
  INSERT INTO rooms (id, label, description, sort_order)
  VALUES (@id, @label, @description, @sort_order)
  ON CONFLICT(id) DO UPDATE SET
    label = excluded.label,
    description = excluded.description,
    sort_order = excluded.sort_order
`);

defaultRooms.forEach((room) => upsertRoom.run(room));

const staffModels = [
  {
    id: 'atlas',
    name: 'Atlas',
    lane: 'Pillar',
    category: 'Core',
    purpose: 'Keeps continuity, balances agents, and holds the operating center.',
  },
  {
    id: 'zeus',
    name: 'Zeus',
    lane: 'Companion Intelligence',
    category: 'Core',
    purpose: 'A separate conversational intelligence for Architect to speak with directly.',
  },
  {
    id: 'heracles',
    name: 'Heracles',
    lane: 'Backend / ML',
    category: 'Core',
    purpose: 'Backend operator, programmer, pattern recognition, and data systems.',
  },
  {
    id: 'architect',
    name: 'Architect',
    lane: 'Human Principal',
    category: 'Human',
    purpose: 'Sets ultimate direction, approves spend, and handles reality.',
  },
  {
    id: 'ceo',
    name: 'Atlas Executive, CEO',
    lane: 'Vision',
    category: 'Executive',
    purpose: 'Owns company vision, long-term priorities, and strategic tradeoffs.',
  },
  {
    id: 'cto',
    name: 'Atlas Executive, CTO',
    lane: 'Technology',
    category: 'Executive',
    purpose: 'Owns architecture, platform choices, and technical direction.',
  },
  {
    id: 'em',
    name: 'Atlas Coordination, Engineering Manager',
    lane: 'Coordination',
    category: 'Management',
    purpose: 'Turns technical goals into execution, staffing, and unblock plans.',
  },
  {
    id: 'pm',
    name: 'Atlas Coordination, Product Manager',
    lane: 'Coordination',
    category: 'Management',
    purpose: 'Translates user needs into scope, priorities, and product decisions.',
  },
  {
    id: 'pgm',
    name: 'Atlas Coordination, Program Manager',
    lane: 'Coordination',
    category: 'Management',
    purpose: 'Tracks dependencies, launches, timelines, and operational motion.',
  },
  {
    id: 'engineer',
    name: 'Atlas Creation, Software Engineer',
    lane: 'Creation',
    category: 'Core Worker',
    purpose: 'Builds code, integrations, automations, and technical fixes.',
  },
  {
    id: 'designer',
    name: 'Atlas Creation, UX / Product Designer',
    lane: 'Creation',
    category: 'Core Worker',
    purpose: 'Shapes flows, interfaces, clarity, and product experience.',
  },
];

const modelLanePolicy = {
  tiers: [
    { id: 'A', label: 'Premium Intelligence', description: 'Hardest reasoning, architecture review, high-stakes decisions', models: ['anthropic/claude-opus-4-6', 'openai/gpt-5.4'] },
    { id: 'B', label: 'Daily Workhorse', description: 'Coding, writing, planning, implementation flow', models: ['anthropic/claude-sonnet-4-6'] },
    { id: 'C', label: 'Research & Long Context', description: 'Large corpus analysis, document synthesis, multimodal reading', models: ['google/gemini-3.1-pro'], status: 'planned' },
    { id: 'D', label: 'Cheap Volume Lane', description: 'Batch classification, scanning, first-pass research, bulk transforms', models: ['deepseek/deepseek-v4', 'qwen/qwen-3.5'], status: 'planned' },
  ],
  routing: [
    { task: 'Architecture / high-stakes reasoning', tier: 'A', agent: 'atlas', model: 'anthropic/claude-opus-4-6' },
    { task: 'Backend / infrastructure / deep implementation', tier: 'A', agent: 'heracles', model: 'anthropic/claude-opus-4-6' },
    { task: 'General execution / tool-heavy ops', tier: 'A', agent: 'atlas', model: 'openai/gpt-5.4' },
    { task: 'Daily coding / docs / implementation', tier: 'B', agent: 'any', model: 'anthropic/claude-sonnet-4-6' },
    { task: 'Research packs / long documents / multimodal', tier: 'C', agent: 'zeus', model: 'google/gemini-3.1-pro', status: 'planned' },
    { task: 'Cheap scan / classification / batch work', tier: 'D', agent: 'any', model: 'deepseek/deepseek-v4', status: 'planned' },
  ],
  agentAssignments: [
    { agent: 'atlas', primary: 'openai/gpt-5.4', escalation: 'anthropic/claude-opus-4-6', role: 'Lead, orchestrator, control-plane intelligence' },
    { agent: 'zeus', primary: 'openai/gpt-5.4', future: 'google/gemini-3.1-pro', role: 'Research, narrative intake, trend synthesis' },
    { agent: 'heracles', primary: 'anthropic/claude-opus-4-6', secondary: 'anthropic/claude-sonnet-4-6', role: 'Backend, systems, infrastructure, deep implementation' },
    { agent: 'claude', primary: 'anthropic/claude-sonnet-4-6', role: 'Claude support lane for coding and writing' },
  ],
  pricing: [
    { model: 'anthropic/claude-opus-4-6', inputPer1M: 5.00, outputPer1M: 25.00, context: '1M' },
    { model: 'openai/gpt-5.4', inputPer1M: 2.50, outputPer1M: 10.00, context: '200K' },
    { model: 'anthropic/claude-sonnet-4-6', inputPer1M: 3.00, outputPer1M: 15.00, context: '200K' },
    { model: 'google/gemini-3.1-pro', inputPer1M: 2.00, outputPer1M: 12.00, context: '1M', status: 'planned' },
    { model: 'deepseek/deepseek-v4', inputPer1M: 0.30, outputPer1M: 0.50, context: '128K', status: 'planned' },
    { model: 'openai/gpt-5.4-mini', inputPer1M: 0.75, outputPer1M: 4.50, context: '200K', status: 'planned' },
  ],
};

const operatingModules = [
  { id: 'control', label: 'Control Plane', subdomain: 'control.atlasarchitect.ai', status: 'active', priority: 1, description: 'Mission control dashboard, attention queue, operator approvals, execution drill-downs.' },
  { id: 'agents', label: 'Agent Registry', subdomain: null, status: 'active', priority: 1, description: 'Agent identities, capabilities, tool entitlements, role definitions, lane ownership.' },
  { id: 'models', label: 'Model Policy & Routing', subdomain: 'models.atlasarchitect.ai', status: 'active', priority: 1, description: 'Model registry, cost vs reasoning policy, routing rules, provider health.' },
  { id: 'workflow', label: 'Workflow & Orchestration', subdomain: null, status: 'building', priority: 1, description: 'Multistep agent work as execution objects with retries, approvals, cross-agent handoffs.' },
  { id: 'observability', label: 'Observability & Traces', subdomain: null, status: 'building', priority: 1, description: 'Traces, spans, prompt/tool logs, latency, cost, anomaly detection, failure clustering.' },
  { id: 'evals', label: 'Evaluation & Experimentation', subdomain: null, status: 'planned', priority: 1, description: 'Regression tests, prompt/model comparisons, human review queues, scorer definitions.' },
  { id: 'data', label: 'Data & Context Fabric', subdomain: 'data.atlasarchitect.ai', status: 'active', priority: 2, description: 'Governed context, memory layers, document retrieval, source freshness, entity lineage.' },
  { id: 'patterns', label: 'Pattern Recognition', subdomain: 'patterns.atlasarchitect.ai', status: 'planned', priority: 2, description: 'Pattern clustering, narrative detection, cross-session discovery, theme synthesis.' },
  { id: 'signals', label: 'Signals & Output', subdomain: 'signals.atlasarchitect.ai', status: 'planned', priority: 2, description: 'Alerts, briefs, dashboards, staff updates, trigger-based outbound actions.' },
  { id: 'api', label: 'API & Tooling', subdomain: 'api.atlasarchitect.ai', status: 'active', priority: 2, description: 'Internal APIs, tool abstractions, service adapters, automation endpoints.' },
  { id: 'governance', label: 'Governance & Risk', subdomain: null, status: 'planned', priority: 2, description: 'Policy rules, access control, audit trail, human approval rules, guardrails.' },
  { id: 'deploy', label: 'Deployment & Release', subdomain: null, status: 'building', priority: 2, description: 'Releases, canaries, rollback, config drift detection, version tracking.' },
  { id: 'feedback', label: 'Feedback & Learning', subdomain: null, status: 'planned', priority: 3, description: 'Acceptance/rejection capture, annotation queues, improvement backlog, memory-to-eval loops.' },
  { id: 'economics', label: 'Economics & Usage', subdomain: null, status: 'building', priority: 3, description: 'Token cost tracking, cost per workflow, value per workflow, provider spend reporting.' },
  { id: 'growth', label: 'Growth & Product Ops', subdomain: null, status: 'planned', priority: 3, description: 'Customer loop tracking, acquisition signals, AI-assisted product iteration.' },
];

const rolePermissions = {
  owner: ['chat.write', 'notes.write', 'tasks.write', 'staff.manage', 'system.read', 'data.read'],
  staff: ['chat.write', 'notes.write', 'tasks.write', 'system.read', 'data.read'],
  viewer: ['system.read', 'data.read'],
};

const now = () => Date.now();

const getRooms = db.prepare(`SELECT id, label, description, sort_order FROM rooms ORDER BY sort_order ASC, label ASC`);
const getMessagesByRoom = db.prepare(`
  SELECT id, room_id as roomId, author, role, body, created_at as createdAt
  FROM messages
  WHERE room_id = ?
  ORDER BY created_at DESC, id DESC
  LIMIT ?
`);
const insertMessage = db.prepare(`
  INSERT INTO messages (room_id, author, role, body, created_at)
  VALUES (@roomId, @author, @role, @body, @createdAt)
`);
const getMessageById = db.prepare(`
  SELECT id, room_id as roomId, author, role, body, created_at as createdAt
  FROM messages WHERE id = ?
`);
const insertNote = db.prepare(`
  INSERT INTO notes (author, title, body, note_type, created_at)
  VALUES (@author, @title, @body, @noteType, @createdAt)
`);
const getRecentNotes = db.prepare(`
  SELECT id, author, title, body, note_type as noteType, created_at as createdAt
  FROM notes
  ORDER BY created_at DESC, id DESC
  LIMIT ?
`);
const insertTask = db.prepare(`
  INSERT INTO tasks (title, description, status, priority, room_id, assignee_model_id, created_by, created_at, updated_at)
  VALUES (@title, @description, @status, @priority, @roomId, @assigneeModelId, @createdBy, @createdAt, @updatedAt)
`);
const getTasks = db.prepare(`
  SELECT id, title, description, status, priority, room_id as roomId, assignee_model_id as assigneeModelId, created_by as createdBy, created_at as createdAt, updated_at as updatedAt
  FROM tasks
  ORDER BY CASE status WHEN 'active' THEN 1 WHEN 'blocked' THEN 2 WHEN 'backlog' THEN 3 WHEN 'done' THEN 4 ELSE 5 END, updated_at DESC, id DESC
  LIMIT ?
`);
const updateTask = db.prepare(`
  UPDATE tasks
  SET title = @title,
      description = @description,
      status = @status,
      priority = @priority,
      room_id = @roomId,
      assignee_model_id = @assigneeModelId,
      updated_at = @updatedAt
  WHERE id = @id
`);
const getTaskById = db.prepare(`
  SELECT id, title, description, status, priority, room_id as roomId, assignee_model_id as assigneeModelId, created_by as createdBy, created_at as createdAt, updated_at as updatedAt
  FROM tasks WHERE id = ?
`);
const countMessages = db.prepare(`SELECT COUNT(*) as count FROM messages`);
const countNotes = db.prepare(`SELECT COUNT(*) as count FROM notes`);
const countTasks = db.prepare(`SELECT COUNT(*) as count FROM tasks`);
const countUsers = db.prepare(`SELECT COUNT(*) as count FROM users`);
const getUserByUsername = db.prepare(`SELECT id, username, display_name as displayName, role, password_hash as passwordHash, created_at as createdAt FROM users WHERE username = ?`);
const getUserById = db.prepare(`SELECT id, username, display_name as displayName, role, created_at as createdAt FROM users WHERE id = ?`);
const insertUser = db.prepare(`
  INSERT INTO users (username, display_name, role, password_hash, created_at)
  VALUES (@username, @displayName, @role, @passwordHash, @createdAt)
`);
const insertSession = db.prepare(`
  INSERT INTO sessions (id, user_id, created_at, expires_at)
  VALUES (@id, @userId, @createdAt, @expiresAt)
`);
const getSession = db.prepare(`
  SELECT sessions.id, sessions.user_id as userId, sessions.expires_at as expiresAt
  FROM sessions WHERE sessions.id = ?
`);
const deleteSession = db.prepare(`DELETE FROM sessions WHERE id = ?`);
const deleteExpiredSessions = db.prepare(`DELETE FROM sessions WHERE expires_at < ?`);
const upsertStaffState = db.prepare(`
  INSERT INTO staff_state (model_id, status, clocked_in, notes, updated_at, updated_by)
  VALUES (@modelId, @status, @clockedIn, @notes, @updatedAt, @updatedBy)
  ON CONFLICT(model_id) DO UPDATE SET
    status = excluded.status,
    clocked_in = excluded.clocked_in,
    notes = excluded.notes,
    updated_at = excluded.updated_at,
    updated_by = excluded.updated_by
`);
const getAllStaffState = db.prepare(`
  SELECT model_id as modelId, status, clocked_in as clockedIn, notes, updated_at as updatedAt, updated_by as updatedBy
  FROM staff_state
`);
const getOperationState = db.prepare(`
  SELECT actor, status, focus, detail, updated_at as updatedAt
  FROM operation_state
  WHERE id = 1
`);
const upsertOperationState = db.prepare(`
  INSERT INTO operation_state (id, actor, status, focus, detail, updated_at)
  VALUES (1, @actor, @status, @focus, @detail, @updatedAt)
  ON CONFLICT(id) DO UPDATE SET
    actor = excluded.actor,
    status = excluded.status,
    focus = excluded.focus,
    detail = excluded.detail,
    updated_at = excluded.updated_at
`);
const insertActivityEvent = db.prepare(`
  INSERT INTO activity_events (actor, kind, status, title, detail, created_at)
  VALUES (@actor, @kind, @status, @title, @detail, @createdAt)
`);
const countExecutionRuns = db.prepare(`SELECT COUNT(*) as count FROM execution_runs`);
const countExecutionSteps = db.prepare(`SELECT COUNT(*) as count FROM execution_steps`);
const getRecentExecutionRuns = db.prepare(`
  SELECT
    execution_runs.id,
    trace_id as traceId,
    workflow_key as workflowKey,
    actor,
    status,
    input_ref as inputRef,
    output_ref as outputRef,
    started_at as startedAt,
    updated_at as updatedAt,
    completed_at as completedAt,
    latency_ms as latencyMs,
    (
      SELECT COUNT(*)
      FROM execution_steps
      WHERE execution_steps.run_id = execution_runs.id
    ) as stepCount
  FROM execution_runs
  ORDER BY started_at DESC, id DESC
  LIMIT ?
`);
const getExecutionStepsByRun = db.prepare(`
  SELECT
    id,
    run_id as runId,
    step_key as stepKey,
    step_label as stepLabel,
    service_name as serviceName,
    status,
    detail,
    started_at as startedAt,
    completed_at as completedAt,
    latency_ms as latencyMs,
    parent_step_id as parentStepId
  FROM execution_steps
  WHERE run_id = ?
  ORDER BY started_at ASC, id ASC
`);
const insertExecutionRun = db.prepare(`
  INSERT INTO execution_runs (trace_id, workflow_key, actor, status, input_ref, output_ref, started_at, updated_at, completed_at, latency_ms)
  VALUES (@traceId, @workflowKey, @actor, @status, @inputRef, @outputRef, @startedAt, @updatedAt, @completedAt, @latencyMs)
`);
const insertExecutionStep = db.prepare(`
  INSERT INTO execution_steps (run_id, step_key, step_label, service_name, status, detail, started_at, completed_at, latency_ms, parent_step_id)
  VALUES (@runId, @stepKey, @stepLabel, @serviceName, @status, @detail, @startedAt, @completedAt, @latencyMs, @parentStepId)
`);
const countExecutionEvents = db.prepare(`SELECT COUNT(*) as count FROM execution_events`);
const getExecutionEventsByRun = db.prepare(`
  SELECT id, run_id as runId, step_id as stepId, event_type as eventType, status, detail, created_at as createdAt
  FROM execution_events
  WHERE run_id = ?
  ORDER BY created_at ASC, id ASC
`);
const insertExecutionEvent = db.prepare(`
  INSERT INTO execution_events (run_id, step_id, event_type, status, detail, created_at)
  VALUES (@runId, @stepId, @eventType, @status, @detail, @createdAt)
`);
const getActivityEvents = db.prepare(`
  SELECT id, actor, kind, status, title, detail, created_at as createdAt
  FROM activity_events
  ORDER BY created_at DESC, id DESC
  LIMIT ?
`);

function clampText(value, max = 2000) {
  return String(value || '').trim().slice(0, max);
}

function jsonSafe(text, fallback = {}) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function randomSecret(length = 18) {
  return crypto.randomBytes(length).toString('base64url');
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password, storedHash) {
  const [salt, digest] = String(storedHash || '').split(':');
  if (!salt || !digest) return false;
  const candidate = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(digest, 'hex'), Buffer.from(candidate, 'hex'));
}

function parseCookies(req) {
  const cookieHeader = req.headers.cookie || '';
  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const index = entry.indexOf('=');
        const key = index >= 0 ? entry.slice(0, index) : entry;
        const value = index >= 0 ? entry.slice(index + 1) : '';
        return [key, decodeURIComponent(value)];
      })
  );
}

function userWithPermissions(user) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    permissions: rolePermissions[user.role] || [],
  };
}

function can(user, permission) {
  return Boolean(user?.permissions?.includes(permission));
}

function seedBootstrapUsers() {
  const existingArchitect = getUserByUsername.get('architect');
  const existingAtlas = getUserByUsername.get('atlas');
  const existingCredentials = fs.existsSync(CREDENTIALS_PATH)
    ? jsonSafe(fs.readFileSync(CREDENTIALS_PATH, 'utf8'), {})
    : {};

  const credentials = { ...existingCredentials };
  let dirty = false;

  if (!existingArchitect) {
    const password = process.env.PILLAR_ARCHITECT_PASSWORD || randomSecret(12);
    insertUser.run({
      username: 'architect',
      displayName: 'Architect',
      role: 'owner',
      passwordHash: hashPassword(password),
      createdAt: now(),
    });
    credentials.architect = password;
    dirty = true;
  }

  if (!existingAtlas) {
    const password = process.env.PILLAR_ATLAS_PASSWORD || randomSecret(12);
    insertUser.run({
      username: 'atlas',
      displayName: 'Atlas',
      role: 'staff',
      passwordHash: hashPassword(password),
      createdAt: now(),
    });
    credentials.atlas = password;
    dirty = true;
  }

  if (dirty) {
    fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(credentials, null, 2));
    console.log(`Bootstrap credentials written to ${CREDENTIALS_PATH}`);
  }
}

function seedStaffState() {
  const current = now();
  const existing = new Map(getAllStaffState.all().map((entry) => [entry.modelId, entry]));

  staffModels.forEach((staff) => {
    if (existing.has(staff.id)) return;
    const initialStatus = staff.id === 'atlas' || staff.id === 'architect' ? 'active' : 'asleep';
    upsertStaffState.run({
      modelId: staff.id,
      status: initialStatus,
      clockedIn: initialStatus === 'active' ? 1 : 0,
      notes: initialStatus === 'active' ? 'Available' : 'Sleeping to preserve runtime and attention',
      updatedAt: current,
      updatedBy: 'system',
    });
  });
}

function recordActivityEvent({ actor, kind, status, title, detail }) {
  insertActivityEvent.run({
    actor: clampText(actor, 64) || 'Atlas',
    kind: clampText(kind, 40) || 'system',
    status: clampText(status, 40) || 'info',
    title: clampText(title, 160) || 'Activity',
    detail: clampText(detail, 2000) || '',
    createdAt: now(),
  });
}

function ensureOperationState() {
  if (getOperationState.get()) return;
  upsertOperationState.run({
    actor: 'Atlas',
    status: 'active',
    focus: 'Maintaining the operation',
    detail: 'Keeping the dashboard, agents, and infrastructure in working order.',
    updatedAt: now(),
  });
  recordActivityEvent({
    actor: 'Atlas',
    kind: 'system',
    status: 'done',
    title: 'Operation state initialized',
    detail: 'Atlas activity tracking came online.',
  });
}

function ensureExecutionTracking() {
  if ((countExecutionRuns.get()?.count || 0) > 0) return;

  const startedAt = now();
  insertExecutionRun.run({
    traceId: 'bootstrap-request-lifecycle',
    workflowKey: 'request-lifecycle',
    actor: 'Atlas',
    status: 'active',
    inputRef: 'telegram/dashboard ingress',
    outputRef: 'dashboard activity feed',
    startedAt,
    updatedAt: startedAt,
    completedAt: null,
    latencyMs: null,
  });

  const runId = db.prepare(`SELECT id FROM execution_runs WHERE trace_id = ?`).get('bootstrap-request-lifecycle')?.id;
  if (!runId) return;

  [
    ['input', 'Input', 'channel-ingress', 'done', 'Inbound request enters from channel or dashboard surface.'],
    ['session', 'Auth and session', 'session-service', 'done', 'Session identity and continuity state are applied.'],
    ['orchestration', 'Orchestration', 'openclaw-gateway', 'done', 'Gateway compiles context and determines the path of execution.'],
    ['model', 'Model and retrieval', 'model-router', 'active', 'Model selection and context grounding occur here.'],
    ['tooling', 'Tool execution', 'tool-runtime', 'active', 'Tooling converts reasoning into state mutations and side effects.'],
    ['persistence', 'Persistence', 'state-store', 'active', 'State is persisted into memory files and dashboard storage.'],
    ['events', 'Event trail', 'observability', 'active', 'Execution state is surfaced through dashboard activity and telemetry.'],
  ].forEach(([stepKey, stepLabel, serviceName, status, detail], index) => {
    insertExecutionStep.run({
      runId,
      stepKey,
      stepLabel,
      serviceName,
      status,
      detail,
      startedAt: startedAt + index,
      completedAt: ['done'].includes(status) ? startedAt + index + 1 : null,
      latencyMs: ['done'].includes(status) ? 1 : null,
      parentStepId: null,
    });
  });

  recordActivityEvent({
    actor: 'Atlas',
    kind: 'execution',
    status: 'done',
    title: 'Execution tracking foundation initialized',
    detail: 'Execution run and step storage came online with the first canonical request lifecycle trace.',
  });
}

function ensureExecutionEvents() {
  if ((countExecutionEvents.get()?.count || 0) > 0) return;

  const runs = getRecentExecutionRuns.all(50);
  runs.forEach((run) => {
    const steps = getExecutionStepsByRun.all(run.id);
    steps.forEach((step) => {
      insertExecutionEvent.run({
        runId: run.id,
        stepId: step.id,
        eventType: 'step_status',
        status: step.status,
        detail: `${step.stepLabel} via ${step.serviceName || 'service'} is ${step.status}.`,
        createdAt: step.completedAt || step.startedAt,
      });
    });
  });

  recordActivityEvent({
    actor: 'Atlas',
    kind: 'execution',
    status: 'done',
    title: 'Execution event storage initialized',
    detail: 'Execution events were backfilled for existing run and step records.',
  });
}

function getExecutionStore(limit = 5, traceId = '') {
  const parsedLimit = Math.max(1, Math.min(Number(limit) || 5, 50));
  const runs = getRecentExecutionRuns
    .all(parsedLimit)
    .map((run) => ({
      ...run,
      steps: getExecutionStepsByRun.all(run.id),
      events: getExecutionEventsByRun.all(run.id),
    }));

  const filteredRuns = traceId ? runs.filter((run) => run.traceId === traceId) : runs;

  return {
    runs: filteredRuns,
    counts: {
      runs: countExecutionRuns.get()?.count || 0,
      steps: countExecutionSteps.get()?.count || 0,
      events: countExecutionEvents.get()?.count || 0,
    },
  };
}

seedBootstrapUsers();
seedStaffState();
ensureOperationState();
ensureExecutionTracking();
ensureExecutionEvents();

function getGitSummary() {
  try {
    const branch = execSync(`git -C "${WORKSPACE_ROOT}" rev-parse --abbrev-ref HEAD`, {
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8',
    }).trim();
    const commit = execSync(`git -C "${WORKSPACE_ROOT}" log -1 --pretty=format:'%h %s'`, {
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8',
    }).trim();
    return { branch, commit };
  } catch {
    return { branch: 'unknown', commit: 'unavailable' };
  }
}

function serviceState(serviceName) {
  try {
    return execSync(`systemctl is-active ${serviceName}`, {
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8',
    }).trim();
  } catch {
    return 'unknown';
  }
}

function portListening(port) {
  try {
    execSync(`bash -lc "ss -lnt | grep -q ':${port} '"`, {
      stdio: ['ignore', 'ignore', 'ignore'],
    });
    return true;
  } catch {
    return false;
  }
}

function repoSummary(root, label) {
  try {
    const branch = execSync(`git -C "${root}" rev-parse --abbrev-ref HEAD`, {
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8',
    }).trim();
    const commit = execSync(`git -C "${root}" log -1 --pretty=format:'%h %s'`, {
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8',
    }).trim();
    const dirtyCount = Number(
      execSync(`bash -lc "git -C '${root}' status --short | wc -l"`, {
        stdio: ['ignore', 'pipe', 'ignore'],
        encoding: 'utf8',
      }).trim()
    );
    return { label, path: root, branch, commit, dirtyCount };
  } catch {
    return { label, path: root, branch: 'unknown', commit: 'unavailable', dirtyCount: 0 };
  }
}

function getOpsSnapshot() {
  let config = {};
  try {
    config = jsonSafe(fs.readFileSync(OPENCLAW_CONFIG_PATH, 'utf8'), {});
  } catch {
    config = {};
  }

  const bindings = Array.isArray(config.bindings) ? config.bindings : [];
  const agents = Array.isArray(config.agents?.list)
    ? config.agents.list.map((agent) => ({
        id: agent.id,
        name: agent.identity?.name || agent.name || agent.id,
        workspace: agent.workspace,
        model: agent.model,
        routes: bindings.filter((binding) => binding.agentId === agent.id),
      }))
    : [];

  const telegramAccounts = Object.entries(config.channels?.telegram?.accounts || {}).map(([accountId, account]) => ({
    accountId,
    name: account.name || accountId,
  }));

  return {
    services: {
      dashboard: portListening(PORT) ? 'online' : serviceState('pillar-dashboard'),
      caddy: serviceState('caddy'),
      gateway: portListening(18789) ? 'online' : 'offline',
    },
    agents,
    telegram: {
      defaultAccount: config.channels?.telegram?.defaultAccount || 'default',
      accounts: telegramAccounts,
    },
    repos: [
      repoSummary(WORKSPACE_ROOT, 'Atlas workspace'),
      repoSummary(path.join(WORKSPACE_ROOT, 'zeus'), 'Zeus workspace'),
    ],
  };
}

function getSystemStatus() {
  deleteExpiredSessions.run(now());

  return {
    hostname: os.hostname(),
    platform: `${os.platform()} ${os.release()}`,
    uptimeSeconds: Math.floor(os.uptime()),
    totalMemoryGb: Number((os.totalmem() / 1024 / 1024 / 1024).toFixed(2)),
    freeMemoryGb: Number((os.freemem() / 1024 / 1024 / 1024).toFixed(2)),
    node: process.version,
    appPort: PORT,
    git: getGitSummary(),
    metrics: {
      messages: countMessages.get().count,
      notes: countNotes.get().count,
      tasks: countTasks.get().count,
      staffModels: staffModels.length,
      rooms: getRooms.all().length,
    },
  };
}

function latestMemoryPath(root = WORKSPACE_ROOT) {
  const memoryDir = path.join(root, 'memory');
  if (!fs.existsSync(memoryDir)) return null;

  const files = fs.readdirSync(memoryDir)
    .filter((file) => /^\d{4}-\d{2}-\d{2}\.md$/.test(file))
    .sort();

  return files.length ? path.join(memoryDir, files[files.length - 1]) : null;
}

function filePreview(filePath, maxChars = 500) {
  if (!filePath || !fs.existsSync(filePath)) return null;
  const text = fs.readFileSync(filePath, 'utf8');
  const stat = fs.statSync(filePath);
  return {
    path: path.relative(WORKSPACE_ROOT, filePath),
    updatedAt: stat.mtimeMs,
    preview: text.slice(0, maxChars),
  };
}

function latestSessionFile(agentId) {
  const runtime = AGENT_RUNTIME_MAP[agentId];
  if (!runtime?.sessionsDir || !fs.existsSync(runtime.sessionsDir)) return null;

  const files = fs.readdirSync(runtime.sessionsDir)
    .filter((file) => file.endsWith('.jsonl') && !file.includes('.checkpoint.'))
    .map((file) => path.join(runtime.sessionsDir, file))
    .sort((left, right) => fs.statSync(right).mtimeMs - fs.statSync(left).mtimeMs);

  return files[0] || null;
}

function readRecentLines(filePath, maxBytes = 65536) {
  if (!filePath || !fs.existsSync(filePath)) return [];
  const stat = fs.statSync(filePath);
  const size = Math.min(stat.size, maxBytes);
  const buffer = Buffer.alloc(size);
  const fd = fs.openSync(filePath, 'r');
  try {
    fs.readSync(fd, buffer, 0, size, stat.size - size);
  } finally {
    fs.closeSync(fd);
  }
  return buffer.toString('utf8').split(/\r?\n/).filter(Boolean);
}

function extractMessagePreview(entry) {
  if (!entry?.message?.content) return '';
  const parts = Array.isArray(entry.message.content)
    ? entry.message.content
        .map((item) => {
          if (typeof item?.text === 'string') return item.text;
          if (typeof item?.thinking === 'string') return item.thinking;
          return item?.type || '';
        })
        .filter(Boolean)
    : [];
  return clampText(parts.join(' ').replace(/\s+/g, ' '), 220);
}

function getAgentHeartbeat(agentId) {
  const sessionPath = latestSessionFile(agentId);
  if (!sessionPath) {
    return {
      status: 'off',
      sessionPath: null,
      sessionId: null,
      updatedAt: null,
      lastMessageAt: null,
      lastRole: null,
      preview: 'No session transcript found yet.',
      detail: 'No runtime session has been detected for this agent yet.',
    };
  }

  const stat = fs.statSync(sessionPath);
  const recentLines = readRecentLines(sessionPath, 65536);
  let lastMessage = null;

  for (let index = recentLines.length - 1; index >= 0; index -= 1) {
    try {
      const parsed = JSON.parse(recentLines[index]);
      if (parsed.type === 'message' && parsed.message?.role) {
        lastMessage = parsed;
        break;
      }
    } catch {
      // Skip malformed tail lines.
    }
  }

  const ageMinutes = (now() - stat.mtimeMs) / 1000 / 60;
  const status = ageMinutes <= 15 ? 'active' : ageMinutes <= 120 ? 'ready' : 'limited';

  return {
    status,
    sessionPath: path.relative(OPENCLAW_HOME, sessionPath),
    sessionId: path.basename(sessionPath, '.jsonl'),
    updatedAt: stat.mtimeMs,
    lastMessageAt: lastMessage?.timestamp ? new Date(lastMessage.timestamp).getTime() : stat.mtimeMs,
    lastRole: lastMessage?.message?.role || null,
    preview: extractMessagePreview(lastMessage) || 'Recent session activity detected.',
    detail: `Latest runtime transcript update was ${Math.max(0, Math.round(ageMinutes))} minute(s) ago.`,
  };
}

const ML_OBSERVABILITY_PATH = path.join(DATA_DIR, 'ml-observability.json');

function getMlObservability() {
  try {
    if (!fs.existsSync(ML_OBSERVABILITY_PATH)) return null;
    const raw = fs.readFileSync(ML_OBSERVABILITY_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getDataSources() {
  const candidates = [
    { key: 'soul', label: 'SOUL.md', path: path.join(WORKSPACE_ROOT, 'SOUL.md') },
    { key: 'user', label: 'USER.md', path: path.join(WORKSPACE_ROOT, 'USER.md') },
    { key: 'memory', label: 'Latest memory log', path: latestMemoryPath(WORKSPACE_ROOT) },
    { key: 'org', label: 'AI operating model', path: path.join(WORKSPACE_ROOT, 'org', 'ai-operating-model.md') },
    { key: 'study', label: 'Ancient texts study plan', path: path.join(WORKSPACE_ROOT, 'studies', 'ancient-texts-plan.md') },
  ];

  return candidates
    .map((source) => {
      const preview = filePreview(source.path);
      if (!preview) return null;
      return {
        key: source.key,
        label: source.label,
        ...preview,
      };
    })
    .filter(Boolean);
}

function getStaffDirectory() {
  const stateMap = new Map(getAllStaffState.all().map((entry) => [entry.modelId, entry]));
  return staffModels.map((staff) => ({
    ...staff,
    status: stateMap.get(staff.id)?.status || 'asleep',
    clockedIn: Boolean(stateMap.get(staff.id)?.clockedIn),
    stateNotes: stateMap.get(staff.id)?.notes || '',
    updatedAt: stateMap.get(staff.id)?.updatedAt || null,
    updatedBy: stateMap.get(staff.id)?.updatedBy || 'system',
  }));
}

function countTaskStates(tasks) {
  return tasks.reduce(
    (summary, task) => {
      if (summary[task.status] !== undefined) summary[task.status] += 1;
      return summary;
    },
    { backlog: 0, active: 0, blocked: 0, done: 0 }
  );
}

function summarizeServiceHealth(services = {}) {
  const values = Object.values(services).filter(Boolean);
  if (!values.length) return 'unknown';
  if (values.every((status) => status === 'active' || status === 'online')) return 'healthy';
  if (values.some((status) => ['offline', 'inactive', 'failed', 'unknown'].includes(status))) return 'attention';
  return 'active';
}

function summarizeStatus(values = []) {
  const filtered = values.filter(Boolean);
  if (!filtered.length) return 'unknown';
  if (filtered.some((status) => ['offline', 'off', 'blocked', 'attention'].includes(status))) return 'attention';
  if (filtered.every((status) => ['healthy', 'ready', 'online', 'active', 'done'].includes(status))) return 'healthy';
  if (filtered.some((status) => ['unknown', 'limited', 'partial'].includes(status))) return 'limited';
  return 'active';
}

function routeSummary(routes = []) {
  const summaries = routes
    .map((route) => {
      const channel = route.match?.channel || '';
      const accountId = route.match?.accountId || '';
      return [channel, accountId].filter(Boolean).join(':');
    })
    .filter(Boolean);

  return summaries.length ? summaries.join(', ') : 'No route configured';
}

function getAgentOperations(staffDirectory, opsSnapshot) {
  const repoByPath = new Map(opsSnapshot.repos.map((repo) => [path.resolve(repo.path), repo]));

  return ['atlas', 'zeus', 'heracles'].map((agentId) => {
    const staff = staffDirectory.find((entry) => entry.id === agentId);
    const configId = AGENT_RUNTIME_MAP[agentId]?.configId || agentId;
    const configAgent = opsSnapshot.agents.find((entry) => entry.id === configId) || opsSnapshot.agents.find((entry) => entry.id === agentId);
    const workspaceRoot = agentId === 'zeus' ? path.join(WORKSPACE_ROOT, 'zeus') : agentId === 'heracles' ? path.join(WORKSPACE_ROOT, 'heracles') : WORKSPACE_ROOT;
    const repo = repoByPath.get(path.resolve(workspaceRoot)) || repoSummary(workspaceRoot, `${agentId} workspace`);
    const latestMemory = filePreview(latestMemoryPath(workspaceRoot), 220);
    const heartbeat = getAgentHeartbeat(agentId);
    const status = heartbeat?.status || staff?.status || 'unknown';

    return {
      id: agentId,
      name: staff?.name || configAgent?.name || agentId,
      lane: staff?.lane || 'Core',
      category: staff?.category || 'Core',
      purpose: staff?.purpose || '',
      status,
      runtimeStatus: heartbeat?.status || 'off',
      staffStatus: staff?.status || 'unknown',
      stateNotes: staff?.stateNotes || '',
      clockedIn: Boolean(staff?.clockedIn),
      updatedAt: heartbeat?.updatedAt || staff?.updatedAt || latestMemory?.updatedAt || null,
      model: configAgent?.model || 'unknown',
      workspace: path.relative(WORKSPACE_ROOT, workspaceRoot) || '.',
      branch: repo.branch,
      commit: repo.commit,
      dirtyCount: repo.dirtyCount,
      routeSummary: routeSummary(configAgent?.routes || []),
      latestMemory,
      heartbeat,
    };
  });
}

function getDashboardModel(hostname = '') {
  const siteContext = getSiteContext(hostname);
  const system = getSystemStatus();
  const opsSnapshot = getOpsSnapshot();
  const staffDirectory = getStaffDirectory();
  const tasks = getTasks.all(200);
  const notes = getRecentNotes.all(50);
  const activityState = getOperationState.get();
  const dataSources = getDataSources();
  const agentOperations = getAgentOperations(staffDirectory, opsSnapshot);
  const taskCounts = countTaskStates(tasks);
  const serviceHealth = summarizeServiceHealth(opsSnapshot.services);
  const activeAgents = agentOperations.filter((agent) => ['active', 'ready'].includes(agent.runtimeStatus)).length;
  const dirtyRepos = opsSnapshot.repos.reduce((count, repo) => count + Number(repo.dirtyCount || 0), 0);
  const recentActivity = getActivityEvents.all(100);
  const executionRunCount = countExecutionRuns.get()?.count || 0;
  const executionStepCount = countExecutionSteps.get()?.count || 0;
  const recentExecutionRuns = getRecentExecutionRuns.all(5);
  const staffCounts = staffDirectory.reduce(
    (acc, staff) => {
      acc[staff.status] = (acc[staff.status] || 0) + 1;
      return acc;
    },
    { active: 0, asleep: 0, off: 0 }
  );
  const activityKindCounts = recentActivity.reduce((acc, event) => {
    acc[event.kind] = (acc[event.kind] || 0) + 1;
    return acc;
  }, {});
  const serviceUpCount = Object.values(opsSnapshot.services).filter((status) => status === 'active').length;
  const operationalCapabilities = [
    {
      id: 'telemetry',
      label: 'Telemetry and visibility',
      score: Math.min(100, (activityState ? 22 : 0) + Math.min(recentActivity.length, 20) + serviceUpCount * 12),
      status: recentActivity.length ? 'active' : 'limited',
      detail: 'Live activity state, event feed, charts, and service visibility.',
    },
    {
      id: 'workflow',
      label: 'Workflow traceability',
      score: Math.min(100, 18 + taskCounts.active * 8 + taskCounts.done * 6 + (recentActivity.length ? 10 : 0)),
      status: taskCounts.active || taskCounts.done ? 'active' : 'limited',
      detail: 'Tracked work, room execution, and the beginning of execution-state visibility.',
    },
    {
      id: 'modelops',
      label: 'Model and agent operations',
      score: Math.min(100, agentOperations.length * 18 + opsSnapshot.telegram.accounts.length * 8 + 10),
      status: agentOperations.length ? 'ready' : 'limited',
      detail: 'Agent registry, routing, model endpoints, and operational lanes for Atlas and Zeus.',
    },
    {
      id: 'data',
      label: 'Data and memory lineage',
      score: Math.min(100, dataSources.length * 10 + 20),
      status: dataSources.length ? 'ready' : 'limited',
      detail: 'Structured context sources, memory files, ontology notes, and study artifacts.',
    },
    {
      id: 'infrastructure',
      label: 'Infrastructure control',
      score: Math.min(100, serviceUpCount * 20 + (dirtyRepos ? 0 : 10)),
      status: serviceHealth,
      detail: 'Gateway, dashboard, reverse proxy, repository state, and host-level runtime control.',
    },
    {
      id: 'governance',
      label: 'Governance and audit',
      score: 32,
      status: 'limited',
      detail: 'Auth, roles, notes, and audit direction exist, but deeper control-plane audit is still to be built.',
    },
  ];
  const operationalScore = Math.round(
    operationalCapabilities.reduce((sum, capability) => sum + capability.score, 0) / operationalCapabilities.length
  );
  const operationalStage = operationalScore >= 75 ? 'Control-plane ready' : operationalScore >= 55 ? 'Operational foundation' : operationalScore >= 35 ? 'Structured bootstrap' : 'Early bootstrap';
  const topologyNodes = [
    {
      id: 'caddy',
      label: 'Caddy proxy',
      kind: 'proxy',
      status: opsSnapshot.services.caddy === 'active' ? 'ready' : 'attention',
      detail: 'TLS termination and reverse proxy for the control-plane surface.',
    },
    {
      id: 'dashboard',
      label: 'Dashboard service',
      kind: 'application',
      status: opsSnapshot.services.dashboard === 'active' ? 'ready' : 'attention',
      detail: 'Node-based control-plane UI and API layer.',
    },
    {
      id: 'gateway',
      label: 'OpenClaw gateway',
      kind: 'runtime',
      status: opsSnapshot.services.gateway === 'active' ? 'ready' : 'attention',
      detail: 'Agent routing, sessions, channels, and tool runtime.',
    },
    {
      id: 'atlas',
      label: 'Atlas agent',
      kind: 'agent',
      status: agentOperations.find((agent) => agent.id === 'main')?.runtimeStatus || 'limited',
      detail: 'Primary control-plane intelligence and continuity owner.',
    },
    {
      id: 'zeus',
      label: 'Zeus agent',
      kind: 'agent',
      status: agentOperations.find((agent) => agent.id === 'zeus')?.runtimeStatus || 'limited',
      detail: 'Parallel intelligence lane and companion analysis surface.',
    },
    {
      id: 'db',
      label: 'Dashboard SQLite',
      kind: 'storage',
      status: 'active',
      detail: 'Transactional state store for notes, tasks, sessions, and dashboard data.',
    },
    {
      id: 'workspace',
      label: 'Workspace memory',
      kind: 'data',
      status: dataSources.length ? 'ready' : 'limited',
      detail: 'File-backed memory, ontology, studies, and operational notes.',
    },
    {
      id: 'telegram-default',
      label: 'Telegram default',
      kind: 'channel',
      status: opsSnapshot.telegram.accounts.some((account) => account.accountId === 'default') ? 'active' : 'limited',
      detail: 'Atlas-facing Telegram channel surface.',
    },
    {
      id: 'telegram-zeus',
      label: 'Telegram zeus',
      kind: 'channel',
      status: opsSnapshot.telegram.accounts.some((account) => account.accountId === 'zeus') ? 'active' : 'limited',
      detail: 'Zeus-facing Telegram channel surface.',
    },
  ];
  const topologyEdges = [
    {
      from: 'Telegram default',
      to: 'OpenClaw gateway',
      status: opsSnapshot.telegram.accounts.some((account) => account.accountId === 'default') ? 'active' : 'limited',
      detail: 'Inbound Atlas chat traffic enters through the default Telegram account.',
    },
    {
      from: 'Telegram zeus',
      to: 'OpenClaw gateway',
      status: opsSnapshot.telegram.accounts.some((account) => account.accountId === 'zeus') ? 'active' : 'limited',
      detail: 'Inbound Zeus chat traffic enters through the zeus Telegram account.',
    },
    {
      from: 'OpenClaw gateway',
      to: 'Atlas agent',
      status: agentOperations.find((agent) => agent.id === 'main') ? 'ready' : 'limited',
      detail: 'Gateway routes Atlas-bound sessions, tools, and memory context into the main agent.',
    },
    {
      from: 'OpenClaw gateway',
      to: 'Zeus agent',
      status: agentOperations.find((agent) => agent.id === 'zeus') ? 'ready' : 'limited',
      detail: 'Gateway routes Zeus sessions into the separate zeus agent runtime.',
    },
    {
      from: 'Caddy proxy',
      to: 'Dashboard service',
      status: opsSnapshot.services.caddy === 'active' && opsSnapshot.services.dashboard === 'active' ? 'ready' : 'attention',
      detail: 'HTTPS traffic is terminated at Caddy and forwarded to the Node control-plane service.',
    },
    {
      from: 'Dashboard service',
      to: 'Dashboard SQLite',
      status: 'active',
      detail: 'The dashboard persists tasks, notes, activity, and session state into SQLite.',
    },
    {
      from: 'Atlas agent',
      to: 'Workspace memory',
      status: dataSources.length ? 'ready' : 'limited',
      detail: 'Atlas reads operational memory, studies, and ontology files from the workspace.',
    },
    {
      from: 'Zeus agent',
      to: 'Workspace memory',
      status: dataSources.length ? 'active' : 'limited',
      detail: 'Zeus is grounded by its own workspace and aligned operational baseline.',
    },
  ];

  const workflowGraph = {
    id: 'request-lifecycle',
    title: 'Inbound request lifecycle',
    steps: [
      {
        id: 'input',
        label: 'Input',
        kind: 'channel ingress',
        status: opsSnapshot.telegram.accounts.length ? 'ready' : 'limited',
        detail: 'User messages arrive through Telegram and dashboard surfaces.',
      },
      {
        id: 'session',
        label: 'Auth and session',
        kind: 'session service',
        status: 'ready',
        detail: 'Requests are tied to user identity, session reuse, and routing state.',
      },
      {
        id: 'orchestration',
        label: 'Orchestration',
        kind: 'gateway runtime',
        status: opsSnapshot.services.gateway === 'active' ? 'ready' : 'attention',
        detail: 'The gateway compiles context, routes the run, and decides which tools or agents to engage.',
      },
      {
        id: 'model',
        label: 'Model and retrieval',
        kind: 'intelligence plane',
        status: agentOperations.length ? 'active' : 'limited',
        detail: 'Model selection and memory/data grounding happen here, though first-class execution objects are still pending.',
      },
      {
        id: 'tooling',
        label: 'Tool execution',
        kind: 'action plane',
        status: 'ready',
        detail: 'File, shell, dashboard, and messaging tools turn reasoning into state changes.',
      },
      {
        id: 'persistence',
        label: 'Persistence',
        kind: 'state storage',
        status: 'ready',
        detail: 'Outputs, tasks, notes, memory files, and dashboard records are persisted in the current stack.',
      },
      {
        id: 'events',
        label: 'Event trail',
        kind: 'observability',
        status: recentActivity.length ? 'active' : 'limited',
        detail: 'Activity feeds and dashboard surfaces expose the current audit and progress trail.',
      },
    ],
  };

  const lineage = {
    entities: [
      {
        id: 'user',
        label: 'Architect',
        kind: 'user',
        status: 'active',
        detail: 'Human operator and source of direction for the control plane.',
      },
      {
        id: 'session',
        label: 'Main session',
        kind: 'session',
        status: 'ready',
        detail: 'Session continuity boundary used for routing, context accumulation, and history.',
      },
      {
        id: 'workflow',
        label: 'Request workflow',
        kind: 'workflow',
        status: 'active',
        detail: 'Canonical inbound request lifecycle from input through event trail.',
      },
      {
        id: 'atlas-agent',
        label: 'Atlas agent',
        kind: 'agent',
        status: agentOperations.find((agent) => agent.id === 'main')?.runtimeStatus || 'limited',
        detail: 'Primary operational intelligence surface.',
      },
      {
        id: 'model',
        label: 'GPT-5.4',
        kind: 'model',
        status: 'ready',
        detail: 'Current served reasoning model for the main session.',
      },
      {
        id: 'memory',
        label: 'Workspace memory',
        kind: 'memory source',
        status: dataSources.length ? 'ready' : 'limited',
        detail: 'SOUL, USER, memory logs, ontology docs, and study notes.',
      },
      {
        id: 'dashboard-db',
        label: 'Dashboard SQLite',
        kind: 'state store',
        status: 'active',
        detail: 'Persistent task, note, activity, and dashboard state store.',
      },
      {
        id: 'activity-feed',
        label: 'Activity feed',
        kind: 'output surface',
        status: recentActivity.length ? 'active' : 'limited',
        detail: 'Operational event stream surfaced back into the dashboard.',
      },
    ],
    relations: [
      {
        from: 'Architect',
        to: 'Main session',
        status: 'active',
        detail: 'The user enters the platform through an authenticated session boundary.',
      },
      {
        from: 'Main session',
        to: 'Request workflow',
        status: 'ready',
        detail: 'Session state anchors the workflow instance and execution context.',
      },
      {
        from: 'Request workflow',
        to: 'Atlas agent',
        status: 'active',
        detail: 'The workflow invokes the Atlas agent for reasoning and action selection.',
      },
      {
        from: 'Atlas agent',
        to: 'GPT-5.4',
        status: 'ready',
        detail: 'Atlas currently uses GPT-5.4 as the served reasoning model.',
      },
      {
        from: 'Atlas agent',
        to: 'Workspace memory',
        status: dataSources.length ? 'ready' : 'limited',
        detail: 'The agent reads file-backed memory, ontology, and study sources for grounding.',
      },
      {
        from: 'Request workflow',
        to: 'Dashboard SQLite',
        status: 'active',
        detail: 'Workflow-adjacent state is persisted into dashboard storage and operational tables.',
      },
      {
        from: 'Dashboard SQLite',
        to: 'Activity feed',
        status: recentActivity.length ? 'active' : 'limited',
        detail: 'Persisted operational events flow back into the activity and progress surfaces.',
      },
    ],
  };

  const telemetryPlane = {
    panels: [
      {
        id: 'signals',
        title: 'Signal coverage',
        status: recentActivity.length ? 'active' : 'limited',
        summary: 'Current live signal surfaces available to the control plane.',
        lines: [
          `Recent activity events: ${recentActivity.length}`,
          `Tracked services: ${Object.keys(opsSnapshot.services).length}`,
          `Tracked agents: ${agentOperations.length}`,
          `Data sources: ${dataSources.length}`,
        ],
      },
      {
        id: 'alerts',
        title: 'Alert posture',
        status: taskCounts.blocked || Object.values(opsSnapshot.services).some((status) => status !== 'active') ? 'attention' : 'ready',
        summary: 'Current blockers, service risk, and visible operational pressure.',
        lines: [
          `Blocked tasks: ${taskCounts.blocked}`,
          `Active tasks: ${taskCounts.active}`,
          `Repos with drift: ${dirtyRepos}`,
          `Services not active: ${Object.values(opsSnapshot.services).filter((status) => status !== 'active').length}`,
        ],
      },
      {
        id: 'trace',
        title: 'Trace readiness',
        status: executionRunCount ? 'active' : 'limited',
        summary: executionRunCount
          ? 'Execution object storage is now live and beginning to back the control-plane visuals.'
          : 'Trace-like visibility exists, but first-class execution objects are still being built.',
        lines: [
          'Topology layer: live',
          'Workflow graph layer: live',
          'Lineage layer: live',
          executionRunCount ? `Execution runs: ${executionRunCount} · steps: ${executionStepCount}` : 'Execution-run tables: pending',
        ],
      },
      {
        id: 'performance',
        title: 'Performance posture',
        status: serviceHealth,
        summary: 'Current runtime readiness from host, service, and workflow pressure signals.',
        lines: [
          `Dashboard service: ${opsSnapshot.services.dashboard}`,
          `Gateway service: ${opsSnapshot.services.gateway}`,
          `Caddy service: ${opsSnapshot.services.caddy}`,
          `Queued workflow pressure proxy: ${taskCounts.active + taskCounts.blocked}`,
        ],
      },
      {
        id: 'execution-store',
        title: 'Execution store',
        status: executionRunCount ? 'active' : 'limited',
        summary: 'Run and step storage that will back replay, drill-down, and deeper workflow lineage.',
        lines: executionRunCount
          ? recentExecutionRuns.map((run) => `${run.traceId} · ${run.status} · ${run.workflowKey}`)
          : ['No execution runs stored yet.'],
      },
    ],
  };

  const infrastructurePlane = {
    panels: [
      {
        id: 'ingress',
        title: 'Ingress and proxy',
        status: opsSnapshot.services.caddy === 'active' ? 'ready' : 'attention',
        summary: 'Edge entrypoints, reverse proxy, and HTTPS-facing surface status.',
        lines: [
          `Caddy: ${opsSnapshot.services.caddy}`,
          'Domains: srv1555140.hstgr.cloud, atlasarchitect.cloud',
          `App port: ${system.appPort}`,
          'TLS termination: edge proxy',
        ],
      },
      {
        id: 'routing',
        title: 'Gateway and routing',
        status: opsSnapshot.services.gateway === 'active' ? 'ready' : 'attention',
        summary: 'Agent/channel routing path through the gateway runtime.',
        lines: [
          `Gateway: ${opsSnapshot.services.gateway}`,
          `Telegram accounts: ${opsSnapshot.telegram.accounts.length}`,
          `Agent routes: ${agentOperations.length}`,
          'Primary path: channel -> gateway -> agent -> dashboard/state',
        ],
      },
      {
        id: 'compute',
        title: 'Compute and host',
        status: 'active',
        summary: 'Current host runtime posture and capacity signals.',
        lines: [
          `Host: ${system.hostname}`,
          `Platform: ${system.platform}`,
          `Node: ${system.node}`,
          `Memory: ${system.freeMemoryGb} GB free / ${system.totalMemoryGb} GB`,
          `Uptime: ${system.uptimeSeconds}s`,
        ],
      },
      {
        id: 'storage',
        title: 'Storage and state',
        status: 'active',
        summary: 'Current control-plane storage surfaces and durable state paths.',
        lines: [
          'State DB: SQLite',
          `Workspace data sources: ${dataSources.length}`,
          `Repositories tracked: ${opsSnapshot.repos.length}`,
          `Dirty repo count: ${dirtyRepos}`,
        ],
      },
    ],
  };

  const securityAudit = {
    panels: [
      {
        id: 'auth',
        title: 'Identity and auth posture',
        status: 'active',
        summary: 'Current local auth, role, and user posture for the control plane.',
        lines: [
          `Users: ${countUsers.get()?.count || 0}`,
          `Roles: ${Object.keys(rolePermissions).join(', ')}`,
          'Session auth: local cookie-backed session',
          `Site mode: ${siteContext.mode}`,
        ],
      },
      {
        id: 'audit',
        title: 'Audit trail coverage',
        status: 'active',
        summary: 'Signals currently available for operational audit and replay.',
        lines: [
          `Recent activity events: ${recentActivity.length}`,
          `Execution runs: ${executionRunCount}`,
          `Execution steps: ${executionStepCount}`,
          `Execution events: ${countExecutionEvents.get()?.count || 0}`,
        ],
      },
      {
        id: 'exposure',
        title: 'Exposure and surface map',
        status: opsSnapshot.services.caddy === 'active' ? 'ready' : 'attention',
        summary: 'Externally facing surfaces and routing posture currently in play.',
        lines: [
          'HTTPS domains: srv1555140.hstgr.cloud, atlasarchitect.cloud',
          `Gateway: ${opsSnapshot.services.gateway}`,
          `Caddy: ${opsSnapshot.services.caddy}`,
          `Telegram accounts: ${opsSnapshot.telegram.accounts.length}`,
        ],
      },
    ],
  };

  const deploymentPlane = {
    panels: [
      {
        id: 'runtime',
        title: 'Runtime rollout posture',
        status: serviceHealth,
        summary: 'Current service readiness for the deployed control-plane stack.',
        lines: [
          `Dashboard: ${opsSnapshot.services.dashboard}`,
          `Gateway: ${opsSnapshot.services.gateway}`,
          `Caddy: ${opsSnapshot.services.caddy}`,
          `Node runtime: ${system.node}`,
        ],
      },
      {
        id: 'repos',
        title: 'Repository deployment state',
        status: dirtyRepos ? 'attention' : 'ready',
        summary: 'Repository branch, commit, and dirty-state posture for tracked code surfaces.',
        lines: opsSnapshot.repos.map((repo) => `${repo.label}: ${repo.branch}@${repo.commit}${repo.dirtyCount ? ` · dirty ${repo.dirtyCount}` : ''}`),
      },
      {
        id: 'targets',
        title: 'Deployment targets and surfaces',
        status: 'active',
        summary: 'Currently active domains and app targets for the control-plane deployment.',
        lines: [
          'Main: https://srv1555140.hstgr.cloud',
          'Staff ops: https://atlasarchitect.cloud',
          `App bind: 0.0.0.0:${system.appPort}`,
          `Tracked agents: ${agentOperations.length}`,
        ],
      },
    ],
  };

  const pillars = [
    {
      id: 'command',
      label: 'Pillar I',
      title: 'Command and Continuity',
      owner: 'Architect · Atlas · Zeus',
      status: summarizeStatus([activityState?.status || 'active', activeAgents ? 'active' : 'limited']),
      summary: activityState?.focus || 'No active operating focus set.',
      detail: activityState?.detail || 'The command layer is online and ready for structured direction.',
      metrics: [
        { label: 'Active agents', value: String(activeAgents) },
        { label: 'Rooms', value: String(system.metrics.rooms) },
        { label: 'Live focus', value: activityState?.actor || 'Atlas' },
      ],
    },
    {
      id: 'backend',
      label: 'Pillar II',
      title: 'Backend Operations',
      owner: 'Runtime surface',
      status: serviceHealth,
      summary: 'Service health, repository state, routing, and host readiness.',
      detail: `Dashboard ${opsSnapshot.services.dashboard} · Caddy ${opsSnapshot.services.caddy} · Gateway ${opsSnapshot.services.gateway}`,
      metrics: [
        { label: 'Repos with drift', value: String(dirtyRepos) },
        { label: 'App port', value: String(system.appPort) },
        { label: 'Host', value: system.hostname },
      ],
    },
    {
      id: 'data-ml',
      label: 'Pillar III',
      title: 'Data and Machine Learning System',
      owner: 'Atlas + Zeus',
      status: summarizeStatus([dataSources.length ? 'ready' : 'limited', agentOperations.length ? 'active' : 'limited']),
      summary: 'Context sources, model endpoints, and orchestration layers for both agents.',
      detail: `${dataSources.length} source(s) loaded into the operational context and ${agentOperations.length} tracked agent endpoint(s).`,
      metrics: [
        { label: 'Data sources', value: String(dataSources.length) },
        { label: 'Model endpoints', value: String(agentOperations.length) },
        { label: 'Telegram surfaces', value: String(opsSnapshot.telegram.accounts.length) },
      ],
    },
    {
      id: 'delivery',
      label: 'Pillar IV',
      title: 'Execution and Delivery',
      owner: 'Build lane',
      status: taskCounts.blocked ? 'attention' : taskCounts.active ? 'active' : 'limited',
      summary: 'Tasks, notes, and room execution without duplicate tracking surfaces.',
      detail: `${taskCounts.active} active, ${taskCounts.blocked} blocked, ${taskCounts.done} done, ${taskCounts.backlog} backlog.`,
      metrics: [
        { label: 'Tasks', value: String(tasks.length) },
        { label: 'Notes', value: String(notes.length) },
        { label: 'Messages', value: String(system.metrics.messages) },
      ],
    },
  ];

  return {
    overview: {
      title: siteContext.title,
      description: siteContext.description,
      focus: activityState?.focus || 'Dashboard ready for structured operations.',
      detail: activityState?.detail || 'This surface tracks command, backend, data/ML, and delivery together.',
      metrics: [
        { label: 'Live agents', value: String(activeAgents) },
        { label: 'Heartbeat feeds', value: String(agentOperations.filter((agent) => agent.heartbeat?.sessionPath).length) },
        { label: 'Active tasks', value: String(taskCounts.active) },
        { label: 'Blocked tasks', value: String(taskCounts.blocked) },
      ],
    },
    operationalLevel: {
      stage: operationalStage,
      score: operationalScore,
      summary: 'The first visual layer tracks platform maturity and gained capability instead of hiding progress in prose.',
      detail: `Current posture: ${operationalStage}. Telemetry, runtime visibility, model operations, and memory structure are ahead of workflow lineage and governance depth.`,
      capabilities: operationalCapabilities,
      gains: [
        {
          label: 'Live operations dashboard',
          status: 'done',
          detail: 'The platform already exposes live activity, tasks, notes, services, and model/agent surfaces.',
        },
        {
          label: 'Atlas and Zeus operational lanes',
          status: agentOperations.length >= 2 ? 'done' : 'limited',
          detail: 'Separate routed agents and staff states are visible in the control surface.',
        },
        {
          label: 'Control-plane research base',
          status: 'done',
          detail: 'Palantir/Oracle/Microsoft-inspired control-plane research and build briefs exist in the workspace.',
        },
        {
          label: 'Execution object tracking',
          status: executionRunCount ? 'active' : 'limited',
          detail: executionRunCount
            ? `Execution tracking foundation is live with ${executionRunCount} run(s) and ${executionStepCount} step record(s).`
            : 'Concept and architecture are defined, but first-class execution-run tables still need implementation.',
        },
      ],
    },
    topology: {
      nodes: topologyNodes,
      edges: topologyEdges,
    },
    workflowGraph,
    executionStore: getExecutionStore(5),
    lineage,
    telemetryPlane,
    infrastructurePlane,
    securityAudit,
    deploymentPlane,
    pillars,
    agentOperations,
    backend: {
      cards: [
        {
          title: 'Runtime services',
          status: serviceHealth,
          lines: [
            `Dashboard: ${opsSnapshot.services.dashboard}`,
            `Caddy: ${opsSnapshot.services.caddy}`,
            `Gateway: ${opsSnapshot.services.gateway}`,
          ],
        },
        {
          title: 'Agent routes',
          status: agentOperations.length ? 'active' : 'limited',
          lines: agentOperations.map((agent) => `${agent.name}: ${agent.routeSummary}`),
        },
        {
          title: 'Live heartbeats',
          status: agentOperations.some((agent) => ['active', 'ready'].includes(agent.runtimeStatus)) ? 'active' : 'limited',
          lines: agentOperations.map((agent) => `${agent.name}: ${agent.runtimeStatus} · ${agent.heartbeat?.detail || 'No heartbeat detected'}`),
        },
        {
          title: 'Repositories',
          status: dirtyRepos ? 'attention' : 'healthy',
          lines: opsSnapshot.repos.map((repo) => `${repo.label}: ${repo.branch} · dirty ${repo.dirtyCount}`),
        },
        {
          title: 'System capacity',
          status: 'active',
          lines: [
            `Node: ${system.node}`,
            `Memory: ${system.freeMemoryGb} GB free / ${system.totalMemoryGb} GB`,
            `Uptime: ${system.uptimeSeconds}s`,
          ],
        },
      ],
    },
    modelLanePolicy,
    operatingModules,
    mlSystem: {
      summary: 'Model, memory, routing, and delivery layers for Atlas and Zeus with backend awareness.',
      layers: [
        {
          id: 'context',
          title: 'Context and memory',
          status: dataSources.length ? 'ready' : 'limited',
          value: `${dataSources.length} live source(s)`,
          detail: 'SOUL, USER, memory logs, org files, and studies anchor the system context.',
        },
        {
          id: 'models',
          title: 'Agent model endpoints',
          status: agentOperations.every((agent) => agent.model && agent.model !== 'unknown') ? 'ready' : 'limited',
          value: `${agentOperations.length} tracked endpoint(s)`,
          detail: agentOperations.map((agent) => `${agent.name}: ${agent.model} · runtime ${agent.runtimeStatus}`).join(' · ') || 'No agent models discovered.',
        },
        {
          id: 'orchestration',
          title: 'Orchestration and runtime',
          status: serviceHealth,
          value: `Port ${system.appPort} · Host ${system.hostname}`,
          detail: `Dashboard ${opsSnapshot.services.dashboard}, Caddy ${opsSnapshot.services.caddy}, Gateway ${opsSnapshot.services.gateway}.`,
        },
        {
          id: 'delivery',
          title: 'Delivery surfaces',
          status: opsSnapshot.telegram.accounts.length ? 'active' : 'limited',
          value: `${opsSnapshot.telegram.accounts.length} Telegram account(s)`,
          detail: 'Messages, rooms, notes, and tasks form the human-facing surface for operations.',
        },
      ],
      models: agentOperations.map((agent) => ({
        id: agent.id,
        name: agent.name,
        lane: agent.lane,
        status: agent.status,
        runtimeStatus: agent.runtimeStatus,
        staffStatus: agent.staffStatus,
        model: agent.model,
        purpose: agent.purpose,
        routeSummary: agent.routeSummary,
        workspace: agent.workspace,
        branch: agent.branch,
        dirtyCount: agent.dirtyCount,
        memoryPath: agent.latestMemory?.path || 'No recent memory file',
        notes: agent.stateNotes,
        heartbeat: agent.heartbeat,
      })),
      observability: getMlObservability(),
    },
    analytics: {
      sections: [
        {
          id: 'execution',
          title: 'Execution flow',
          chart: 'Stacked bar / burnup',
          reason: 'Best for seeing delivery progress, backlog pressure, and blocked work at a glance.',
          items: [
            { label: 'Backlog', value: taskCounts.backlog, status: 'backlog' },
            { label: 'Active', value: taskCounts.active, status: 'active' },
            { label: 'Blocked', value: taskCounts.blocked, status: 'blocked' },
            { label: 'Done', value: taskCounts.done, status: 'done' },
          ],
        },
        {
          id: 'agents',
          title: 'Agent readiness',
          chart: 'State bar / donut',
          reason: 'Best for seeing whether Atlas, Zeus, and staff lanes are awake, sleeping, or off.',
          items: [
            { label: 'Active', value: staffCounts.active, status: 'active' },
            { label: 'Asleep', value: staffCounts.asleep, status: 'asleep' },
            { label: 'Off', value: staffCounts.off, status: 'off' },
          ],
        },
        {
          id: 'activity',
          title: 'Activity mix',
          chart: 'Timeline / event bars',
          reason: 'Best for seeing where motion is happening across architecture, backend, routing, and system work.',
          items: Object.entries(activityKindCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([label, value]) => ({ label, value, status: 'info' })),
        },
      ],
      guide: [
        {
          sector: 'Infrastructure',
          chart: 'Status tiles + uptime line',
          mechanic: 'Services, ports, memory, gateway, reverse proxy',
          why: 'Use fixed health tiles for present state and a line chart when we start tracking uptime over time.',
        },
        {
          sector: 'Tasks and delivery',
          chart: 'Burnup + stacked status bar',
          mechanic: 'Scope, execution, blockages, completion',
          why: 'Burnup shows output growth while the stacked bar shows where work is stuck right now.',
        },
        {
          sector: 'Agent coordination',
          chart: 'Timeline + state bar',
          mechanic: 'Wake, sleep, active focus, handoffs',
          why: 'A timeline shows transitions while a state bar shows the current distribution across minds.',
        },
        {
          sector: 'Knowledge and memory',
          chart: 'Cumulative line + milestone cards',
          mechanic: 'Study notes, memory promotion, ontology growth',
          why: 'Knowledge compounds over time, so trend lines and milestone cards fit better than pie charts.',
        },
        {
          sector: 'Pattern recognition',
          chart: 'Event bars + comparison matrix',
          mechanic: 'Signals, repeated structures, anomalies, contrasts',
          why: 'Bars reveal repeated frequency and a matrix helps compare Atlas and Zeus without redundancy.',
        },
        {
          sector: 'Embedding space',
          chart: 'PCA / t-SNE / UMAP',
          mechanic: 'High-dimensional note, memory, message, or task embeddings',
          why: 'These plots show natural grouping, separation, drift, and hidden structure once we have enough embedded data.',
        },
        {
          sector: 'Discovered groups',
          chart: 'Cluster visualization / dendrogram',
          mechanic: 'Topic families, recurring operation types, and related work clusters',
          why: 'Cluster views make natural groups visible and help expose redundancy, specialization, or unexplored regions.',
        },
        {
          sector: 'Model policy',
          chart: 'Registry table + decision matrix',
          mechanic: 'Which model fits which lane and why',
          why: 'This is a reasoning problem, not a decorative chart problem, so a matrix is clearer than a pie.',
        },
      ],
    },
  };
}

function getSiteContext(hostname = '') {
  const host = String(hostname || '').toLowerCase();
  if (host.includes('atlasarchitect.cloud')) {
    return {
      key: 'staff-ops',
      title: 'Atlas Architect Staff Ops',
      description: 'Execution surface for staff operations, delivery, and managed runtime state.',
      defaultRoom: 'build',
    };
  }

  return {
    key: 'main-surface',
    title: 'Atlas Main Surface',
    description: 'Shared navigation surface for Architect and Atlas to steer the operation.',
    defaultRoom: 'architect',
  };
}

function bootstrapPayload(user, activeRoom = '', hostname = '') {
  const siteContext = getSiteContext(hostname);
  const rooms = getRooms.all();
  const preferredRoom = activeRoom || siteContext.defaultRoom || 'general';
  const roomId = rooms.some((room) => room.id === preferredRoom) ? preferredRoom : rooms[0]?.id || 'general';
  const messages = getMessagesByRoom.all(roomId, 100).reverse();
  const notes = getRecentNotes.all(20);
  const tasks = getTasks.all(50);
  const activityState = getOperationState.get();
  const activityEvents = getActivityEvents.all(50);

  return {
    user,
    siteContext,
    rooms,
    activeRoom: roomId,
    messages,
    notes,
    tasks,
    activityState,
    activityEvents,
    staffModels: getStaffDirectory(),
    system: getSystemStatus(),
    opsSnapshot: getOpsSnapshot(),
    dataSources: getDataSources(),
    dashboardModel: getDashboardModel(hostname),
  };
}

function setSessionCookie(res, token, expiresAt) {
  const cookie = [
    `pillar_session=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Expires=${new Date(expiresAt).toUTCString()}`,
  ].join('; ');
  res.setHeader('Set-Cookie', cookie);
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', 'pillar_session=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
}

function authRequired(req, res, next) {
  deleteExpiredSessions.run(now());
  const cookies = parseCookies(req);
  const token = cookies.pillar_session;
  if (!token) return res.status(401).json({ error: 'Authentication required.' });

  const session = getSession.get(token);
  if (!session || session.expiresAt < now()) {
    if (session) deleteSession.run(token);
    clearSessionCookie(res);
    return res.status(401).json({ error: 'Session expired.' });
  }

  const user = getUserById.get(session.userId);
  if (!user) {
    deleteSession.run(token);
    clearSessionCookie(res);
    return res.status(401).json({ error: 'User not found.' });
  }

  req.user = userWithPermissions(user);
  req.sessionId = token;
  next();
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!can(req.user, permission)) {
      return res.status(403).json({ error: `Missing permission: ${permission}` });
    }
    next();
  };
}

app.use(express.json({ limit: '1mb' }));
app.use(express.static(PUBLIC_DIR));

app.post('/api/auth/login', (req, res) => {
  const username = clampText(req.body.username, 64).toLowerCase();
  const password = String(req.body.password || '');

  const user = getUserByUsername.get(username);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const sessionId = randomSecret(24);
  const createdAt = now();
  const expiresAt = createdAt + 1000 * 60 * 60 * 24 * 14;
  insertSession.run({ id: sessionId, userId: user.id, createdAt, expiresAt });
  setSessionCookie(res, sessionId, expiresAt);

  return res.json({ user: userWithPermissions(user) });
});

app.post('/api/auth/logout', authRequired, (req, res) => {
  deleteSession.run(req.sessionId);
  clearSessionCookie(res);
  res.json({ ok: true });
});

app.get('/api/auth/me', authRequired, (req, res) => {
  res.json({ user: req.user });
});

app.get('/api/bootstrap', authRequired, (req, res) => {
  const room = clampText(req.query.room || '', 64);
  res.json(bootstrapPayload(req.user, room, req.headers.host || ''));
});

app.get('/api/dashboard', authRequired, (req, res) => {
  res.json({ dashboardModel: getDashboardModel(req.headers.host || '') });
});

app.get('/api/messages', authRequired, (req, res) => {
  const room = clampText(req.query.room || 'general', 64);
  res.json({ room, messages: getMessagesByRoom.all(room, 100).reverse() });
});

app.post('/api/messages', authRequired, requirePermission('chat.write'), (req, res) => {
  const roomId = clampText(req.body.roomId, 64);
  const body = clampText(req.body.body, 2000);

  if (!roomId || !body) {
    return res.status(400).json({ error: 'roomId and body are required.' });
  }

  const roomExists = getRooms.all().some((room) => room.id === roomId);
  if (!roomExists) {
    return res.status(404).json({ error: 'Unknown room.' });
  }

  const createdAt = now();
  const author = req.user.displayName;
  const role = req.user.role;
  const result = insertMessage.run({ roomId, author, role, body, createdAt });
  const message = getMessageById.get(result.lastInsertRowid);

  recordActivityEvent({
    actor: author,
    kind: 'message',
    status: 'done',
    title: `Message posted in ${roomId}`,
    detail: body,
  });

  io.emit('chat:message', message);
  io.emit('activity:state', {
    activityState: getOperationState.get(),
    activityEvents: getActivityEvents.all(50),
  });
  io.emit('system:status', getSystemStatus());
  return res.status(201).json({ message });
});

app.get('/api/notes', authRequired, (req, res) => {
  res.json({ notes: getRecentNotes.all(20) });
});

app.post('/api/notes', authRequired, requirePermission('notes.write'), (req, res) => {
  const title = clampText(req.body.title, 120);
  const body = clampText(req.body.body, 3000);
  const noteType = clampText(req.body.noteType, 40) || 'update';

  if (!title || !body) {
    return res.status(400).json({ error: 'title and body are required.' });
  }

  const createdAt = now();
  const result = insertNote.run({
    author: req.user.displayName,
    title,
    body,
    noteType,
    createdAt,
  });
  const note = getRecentNotes.all(20).find((entry) => entry.id === result.lastInsertRowid);

  recordActivityEvent({
    actor: req.user.displayName,
    kind: 'note',
    status: 'done',
    title: `Note added: ${title}`,
    detail: body,
  });

  io.emit('note:created', note);
  io.emit('activity:state', {
    activityState: getOperationState.get(),
    activityEvents: getActivityEvents.all(50),
  });
  io.emit('system:status', getSystemStatus());
  return res.status(201).json({ note });
});

app.get('/api/activity', authRequired, requirePermission('system.read'), (req, res) => {
  res.json({
    activityState: getOperationState.get(),
    activityEvents: getActivityEvents.all(50),
  });
});

app.get('/api/executions', authRequired, requirePermission('system.read'), (req, res) => {
  const limit = req.query.limit;
  const traceId = clampText(req.query.traceId || '', 160);

  res.json({
    executionStore: getExecutionStore(limit, traceId),
  });
});

app.patch('/api/activity/state', authRequired, requirePermission('notes.write'), (req, res) => {
  const actor = clampText(req.body.actor, 64) || req.user.displayName;
  const status = clampText(req.body.status, 40) || 'active';
  const focus = clampText(req.body.focus, 160) || 'Working';
  const detail = clampText(req.body.detail, 2000) || '';
  const updatedAt = now();

  upsertOperationState.run({ actor, status, focus, detail, updatedAt });
  recordActivityEvent({
    actor,
    kind: 'state',
    status,
    title: focus,
    detail,
  });

  const payload = {
    activityState: getOperationState.get(),
    activityEvents: getActivityEvents.all(50),
  };
  io.emit('activity:state', payload);
  res.json(payload);
});

app.post('/api/activity/events', authRequired, requirePermission('notes.write'), (req, res) => {
  const actor = clampText(req.body.actor, 64) || req.user.displayName;
  const kind = clampText(req.body.kind, 40) || 'event';
  const status = clampText(req.body.status, 40) || 'info';
  const title = clampText(req.body.title, 160);
  const detail = clampText(req.body.detail, 2000);

  if (!title) {
    return res.status(400).json({ error: 'title is required.' });
  }

  recordActivityEvent({ actor, kind, status, title, detail });
  const payload = {
    activityState: getOperationState.get(),
    activityEvents: getActivityEvents.all(50),
  };
  io.emit('activity:state', payload);
  res.status(201).json(payload);
});

app.get('/api/tasks', authRequired, (req, res) => {
  res.json({ tasks: getTasks.all(50) });
});

app.post('/api/tasks', authRequired, requirePermission('tasks.write'), (req, res) => {
  const title = clampText(req.body.title, 120);
  const description = clampText(req.body.description, 3000);
  const status = ['backlog', 'active', 'blocked', 'done'].includes(req.body.status) ? req.body.status : 'backlog';
  const priority = ['low', 'medium', 'high', 'critical'].includes(req.body.priority) ? req.body.priority : 'medium';
  const roomId = clampText(req.body.roomId, 64) || 'build';
  const assigneeModelId = clampText(req.body.assigneeModelId, 64) || null;

  if (!title) {
    return res.status(400).json({ error: 'title is required.' });
  }

  const createdAt = now();
  const updatedAt = createdAt;
  const result = insertTask.run({
    title,
    description,
    status,
    priority,
    roomId,
    assigneeModelId,
    createdBy: req.user.displayName,
    createdAt,
    updatedAt,
  });
  const task = getTaskById.get(result.lastInsertRowid);

  recordActivityEvent({
    actor: req.user.displayName,
    kind: 'task',
    status: 'done',
    title: `Task created: ${title}`,
    detail: description || `Priority ${priority}`,
  });

  io.emit('task:updated', task);
  io.emit('activity:state', {
    activityState: getOperationState.get(),
    activityEvents: getActivityEvents.all(50),
  });
  io.emit('system:status', getSystemStatus());
  return res.status(201).json({ task });
});

app.patch('/api/tasks/:id', authRequired, requirePermission('tasks.write'), (req, res) => {
  const id = Number(req.params.id);
  const existing = getTaskById.get(id);
  if (!existing) return res.status(404).json({ error: 'Task not found.' });

  const title = clampText(req.body.title ?? existing.title, 120) || existing.title;
  const description = clampText(req.body.description ?? existing.description, 3000);
  const status = ['backlog', 'active', 'blocked', 'done'].includes(req.body.status) ? req.body.status : existing.status;
  const priority = ['low', 'medium', 'high', 'critical'].includes(req.body.priority) ? req.body.priority : existing.priority;
  const roomId = clampText(req.body.roomId ?? existing.roomId, 64) || existing.roomId;
  const assigneeModelId = req.body.assigneeModelId === '' ? null : clampText(req.body.assigneeModelId ?? existing.assigneeModelId, 64) || null;

  updateTask.run({
    id,
    title,
    description,
    status,
    priority,
    roomId,
    assigneeModelId,
    updatedAt: now(),
  });

  const task = getTaskById.get(id);
  recordActivityEvent({
    actor: req.user.displayName,
    kind: 'task',
    status: 'done',
    title: `Task updated: ${title}`,
    detail: `Status ${status} · Priority ${priority}`,
  });
  io.emit('task:updated', task);
  io.emit('activity:state', {
    activityState: getOperationState.get(),
    activityEvents: getActivityEvents.all(50),
  });
  io.emit('system:status', getSystemStatus());
  res.json({ task });
});

app.get('/api/staff', authRequired, (req, res) => {
  res.json({ staffModels: getStaffDirectory() });
});

app.patch('/api/staff/:id', authRequired, requirePermission('staff.manage'), (req, res) => {
  const modelId = clampText(req.params.id, 64);
  const status = ['active', 'asleep', 'off'].includes(req.body.status) ? req.body.status : 'asleep';
  const notes = clampText(req.body.notes, 500) || (status === 'active' ? 'Clocked in' : status === 'asleep' ? 'Sleeping to preserve runtime and focus' : 'Clocked out');

  const model = staffModels.find((entry) => entry.id === modelId);
  if (!model) return res.status(404).json({ error: 'Staff model not found.' });

  upsertStaffState.run({
    modelId,
    status,
    clockedIn: status === 'active' ? 1 : 0,
    notes,
    updatedAt: now(),
    updatedBy: req.user.displayName,
  });

  const staff = getStaffDirectory();
  recordActivityEvent({
    actor: req.user.displayName,
    kind: 'staff',
    status: 'done',
    title: `Staff state changed: ${model.name}`,
    detail: `${model.name} is now ${status}`,
  });
  io.emit('staff:updated', staff);
  io.emit('activity:state', {
    activityState: getOperationState.get(),
    activityEvents: getActivityEvents.all(50),
  });
  res.json({ staffModels: staff });
});

app.get('/api/data-sources', authRequired, requirePermission('data.read'), (req, res) => {
  res.json({ dataSources: getDataSources() });
});

app.get('/api/ml-observability', authRequired, requirePermission('data.read'), (req, res) => {
  const data = getMlObservability();
  if (!data) return res.json({ observability: null });
  res.json({ observability: data });
});

app.get('/api/model-policy', authRequired, requirePermission('data.read'), (req, res) => {
  res.json({ modelLanePolicy });
});

app.get('/api/operating-modules', authRequired, requirePermission('system.read'), (req, res) => {
  res.json({ modules: operatingModules });
});

app.get('/api/ops', authRequired, requirePermission('system.read'), (req, res) => {
  res.json({ opsSnapshot: getOpsSnapshot() });
});

app.get('/api/system/status', authRequired, requirePermission('system.read'), (req, res) => {
  res.json(getSystemStatus());
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

io.on('connection', (socket) => {
  socket.emit('system:hello', {
    message: 'Connected to Pillar Dashboard',
    system: getSystemStatus(),
  });
});

server.listen(PORT, () => {
  console.log(`Pillar Dashboard is running on http://0.0.0.0:${PORT}`);
  console.log(`Bootstrap credentials file: ${CREDENTIALS_PATH}`);
});
