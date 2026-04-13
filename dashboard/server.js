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

seedBootstrapUsers();
seedStaffState();
ensureOperationState();

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

  return ['atlas', 'zeus'].map((agentId) => {
    const staff = staffDirectory.find((entry) => entry.id === agentId);
    const configId = AGENT_RUNTIME_MAP[agentId]?.configId || agentId;
    const configAgent = opsSnapshot.agents.find((entry) => entry.id === configId) || opsSnapshot.agents.find((entry) => entry.id === agentId);
    const workspaceRoot = agentId === 'zeus' ? path.join(WORKSPACE_ROOT, 'zeus') : WORKSPACE_ROOT;
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
          status: 'limited',
          detail: 'Concept and architecture are defined, but first-class execution-run tables still need implementation.',
        },
      ],
    },
    topology: {
      nodes: topologyNodes,
      edges: topologyEdges,
    },
    workflowGraph,
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
