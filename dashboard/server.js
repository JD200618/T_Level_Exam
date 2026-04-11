const fs = require('fs');
const path = require('path');
const os = require('os');
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
`);

const defaultRooms = [
  { id: 'general', label: 'General', description: 'Shared channel for everyone.', sort_order: 1 },
  { id: 'architect', label: 'Architect', description: 'Direct line between Architect and Atlas.', sort_order: 2 },
  { id: 'ops', label: 'Ops', description: 'Infrastructure, hosting, and approvals.', sort_order: 3 },
  { id: 'build', label: 'Build', description: 'Product, engineering, and delivery.', sort_order: 4 },
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
const countMessages = db.prepare(`SELECT COUNT(*) as count FROM messages`);
const countNotes = db.prepare(`SELECT COUNT(*) as count FROM notes`);

function clampText(value, max = 2000) {
  return String(value || '').trim().slice(0, max);
}

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
  const git = getGitSummary();
  return {
    hostname: os.hostname(),
    platform: `${os.platform()} ${os.release()}`,
    uptimeSeconds: Math.floor(os.uptime()),
    totalMemoryGb: Number((os.totalmem() / 1024 / 1024 / 1024).toFixed(2)),
    freeMemoryGb: Number((os.freemem() / 1024 / 1024 / 1024).toFixed(2)),
    node: process.version,
    appPort: PORT,
    git,
    metrics: {
      messages: countMessages.get().count,
      notes: countNotes.get().count,
      staffModels: staffModels.length,
      rooms: getRooms.all().length,
    },
  };
}

function bootstrapPayload(activeRoom = 'general') {
  const rooms = getRooms.all();
  const roomId = rooms.some((room) => room.id === activeRoom) ? activeRoom : rooms[0]?.id || 'general';
  const messages = getMessagesByRoom.all(roomId, 100).reverse();
  const notes = getRecentNotes.all(20);

  return {
    rooms,
    staffModels,
    activeRoom: roomId,
    messages,
    notes,
    system: getSystemStatus(),
  };
}

app.use(express.json({ limit: '1mb' }));
app.use(express.static(PUBLIC_DIR));

app.get('/api/bootstrap', (req, res) => {
  const room = clampText(req.query.room || 'general', 64);
  res.json(bootstrapPayload(room));
});

app.get('/api/messages', (req, res) => {
  const room = clampText(req.query.room || 'general', 64);
  res.json({ room, messages: getMessagesByRoom.all(room, 100).reverse() });
});

app.post('/api/messages', (req, res) => {
  const roomId = clampText(req.body.roomId, 64);
  const author = clampText(req.body.author, 64);
  const role = clampText(req.body.role, 64) || 'guest';
  const body = clampText(req.body.body, 2000);

  if (!roomId || !author || !body) {
    return res.status(400).json({ error: 'roomId, author, and body are required.' });
  }

  const roomExists = getRooms.all().some((room) => room.id === roomId);
  if (!roomExists) {
    return res.status(404).json({ error: 'Unknown room.' });
  }

  const createdAt = Date.now();
  const result = insertMessage.run({ roomId, author, role, body, createdAt });
  const message = getMessageById.get(result.lastInsertRowid);

  io.emit('chat:message', message);
  return res.status(201).json({ message });
});

app.get('/api/notes', (_req, res) => {
  res.json({ notes: getRecentNotes.all(20) });
});

app.post('/api/notes', (req, res) => {
  const author = clampText(req.body.author, 64);
  const title = clampText(req.body.title, 120);
  const body = clampText(req.body.body, 3000);
  const noteType = clampText(req.body.noteType, 40) || 'update';

  if (!author || !title || !body) {
    return res.status(400).json({ error: 'author, title, and body are required.' });
  }

  const createdAt = Date.now();
  const result = insertNote.run({ author, title, body, noteType, createdAt });
  const note = getRecentNotes.all(20).find((entry) => entry.id === result.lastInsertRowid);

  io.emit('note:created', note);
  return res.status(201).json({ note });
});

app.get('/api/system/status', (_req, res) => {
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
});
