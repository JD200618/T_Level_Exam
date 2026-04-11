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
const PUBLIC_DIR = path.join(APP_ROOT, 'public');
const DATA_DIR = path.join(APP_ROOT, 'data');
const DB_PATH = path.join(DATA_DIR, 'pillar.db');
const CREDENTIALS_PATH = path.join(DATA_DIR, 'bootstrap-credentials.json');

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

seedBootstrapUsers();
seedStaffState();

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

function latestMemoryPath() {
  const memoryDir = path.join(WORKSPACE_ROOT, 'memory');
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

function getDataSources() {
  const candidates = [
    { key: 'soul', label: 'SOUL.md', path: path.join(WORKSPACE_ROOT, 'SOUL.md') },
    { key: 'user', label: 'USER.md', path: path.join(WORKSPACE_ROOT, 'USER.md') },
    { key: 'memory', label: 'Latest memory log', path: latestMemoryPath() },
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

  return {
    user,
    siteContext,
    rooms,
    activeRoom: roomId,
    messages,
    notes,
    tasks,
    staffModels: getStaffDirectory(),
    system: getSystemStatus(),
    dataSources: getDataSources(),
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

  io.emit('chat:message', message);
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

  io.emit('note:created', note);
  io.emit('system:status', getSystemStatus());
  return res.status(201).json({ note });
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

  io.emit('task:updated', task);
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
  io.emit('task:updated', task);
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
  io.emit('staff:updated', staff);
  res.json({ staffModels: staff });
});

app.get('/api/data-sources', authRequired, requirePermission('data.read'), (req, res) => {
  res.json({ dataSources: getDataSources() });
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
