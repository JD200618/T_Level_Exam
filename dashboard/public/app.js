const state = {
  rooms: [],
  activeRoom: 'general',
  messages: [],
  notes: [],
  staffModels: [],
  system: null,
  identity: loadIdentity(),
};

const els = {
  displayName: document.querySelector('#displayName'),
  role: document.querySelector('#role'),
  saveIdentity: document.querySelector('#saveIdentity'),
  roomList: document.querySelector('#roomList'),
  roomEyebrow: document.querySelector('#roomEyebrow'),
  roomTitle: document.querySelector('#roomTitle'),
  roomDescription: document.querySelector('#roomDescription'),
  connectionStatus: document.querySelector('#connectionStatus'),
  messageList: document.querySelector('#messageList'),
  messageForm: document.querySelector('#messageForm'),
  messageInput: document.querySelector('#messageInput'),
  staffList: document.querySelector('#staffList'),
  systemStatus: document.querySelector('#systemStatus'),
  noteForm: document.querySelector('#noteForm'),
  noteTitle: document.querySelector('#noteTitle'),
  noteType: document.querySelector('#noteType'),
  noteBody: document.querySelector('#noteBody'),
  noteList: document.querySelector('#noteList'),
};

const socket = io();

bootstrap();
wireEvents();
renderIdentity();

async function bootstrap(room = state.activeRoom) {
  const response = await fetch(`/api/bootstrap?room=${encodeURIComponent(room)}`);
  const data = await response.json();
  state.rooms = data.rooms;
  state.activeRoom = data.activeRoom;
  state.messages = data.messages;
  state.notes = data.notes;
  state.staffModels = data.staffModels;
  state.system = data.system;
  renderAll();
}

function wireEvents() {
  els.saveIdentity.addEventListener('click', () => {
    state.identity = {
      name: (els.displayName.value || 'Guest').trim(),
      role: els.role.value,
    };
    localStorage.setItem('pillar.identity', JSON.stringify(state.identity));
    renderIdentity();
  });

  els.messageForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const body = els.messageInput.value.trim();
    if (!body) return;

    const payload = {
      roomId: state.activeRoom,
      author: state.identity.name,
      role: state.identity.role,
      body,
    };

    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      els.messageInput.value = '';
    }
  });

  els.noteForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const title = els.noteTitle.value.trim();
    const body = els.noteBody.value.trim();
    if (!title || !body) return;

    const payload = {
      author: state.identity.name,
      title,
      body,
      noteType: els.noteType.value,
    };

    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      els.noteTitle.value = '';
      els.noteBody.value = '';
    }
  });

  socket.on('connect', () => {
    els.connectionStatus.textContent = 'Live';
    els.connectionStatus.classList.add('online');
  });

  socket.on('disconnect', () => {
    els.connectionStatus.textContent = 'Offline';
    els.connectionStatus.classList.remove('online');
  });

  socket.on('chat:message', (message) => {
    if (message.roomId === state.activeRoom) {
      state.messages.push(message);
      renderMessages();
    }
    refreshSystem();
  });

  socket.on('note:created', (note) => {
    state.notes.unshift(note);
    renderNotes();
    refreshSystem();
  });

  socket.on('system:hello', ({ system }) => {
    state.system = system;
    renderSystem();
  });
}

async function changeRoom(roomId) {
  state.activeRoom = roomId;
  const response = await fetch(`/api/messages?room=${encodeURIComponent(roomId)}`);
  const data = await response.json();
  state.messages = data.messages;
  renderRooms();
  renderRoomHeader();
  renderMessages();
}

async function refreshSystem() {
  const response = await fetch('/api/system/status');
  state.system = await response.json();
  renderSystem();
}

function renderAll() {
  renderRooms();
  renderRoomHeader();
  renderMessages();
  renderStaff();
  renderSystem();
  renderNotes();
}

function renderIdentity() {
  els.displayName.value = state.identity.name;
  els.role.value = state.identity.role;
}

function renderRooms() {
  els.roomList.innerHTML = '';
  state.rooms.forEach((room) => {
    const button = document.createElement('button');
    button.className = `room-button ${room.id === state.activeRoom ? 'active' : ''}`;
    button.type = 'button';
    button.innerHTML = `<strong>${room.label}</strong><span>${room.description || ''}</span>`;
    button.addEventListener('click', () => changeRoom(room.id));
    els.roomList.appendChild(button);
  });
}

function renderRoomHeader() {
  const room = state.rooms.find((entry) => entry.id === state.activeRoom);
  els.roomEyebrow.textContent = room ? room.id.toUpperCase() : 'ROOM';
  els.roomTitle.textContent = room?.label || 'Room';
  els.roomDescription.textContent = room?.description || '';
}

function renderMessages() {
  els.messageList.innerHTML = '';
  if (!state.messages.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No messages yet. Start the room.';
    els.messageList.appendChild(empty);
    return;
  }

  state.messages.forEach((message) => {
    const item = document.createElement('article');
    item.className = 'message';

    const meta = document.createElement('div');
    meta.className = 'message-meta';
    meta.textContent = `${message.author} · ${message.role} · ${formatTime(message.createdAt)}`;

    const body = document.createElement('div');
    body.className = 'message-body';
    body.textContent = message.body;

    item.append(meta, body);
    els.messageList.appendChild(item);
  });

  els.messageList.scrollTop = els.messageList.scrollHeight;
}

function renderStaff() {
  els.staffList.innerHTML = '';
  state.staffModels.forEach((staff) => {
    const card = document.createElement('article');
    card.className = 'staff-card';
    card.innerHTML = `
      <div class="staff-head">
        <strong>${staff.name}</strong>
        <span>${staff.category}</span>
      </div>
      <p class="muted small">${staff.lane}</p>
      <p>${staff.purpose}</p>
    `;
    els.staffList.appendChild(card);
  });
}

function renderSystem() {
  if (!state.system) return;
  els.systemStatus.innerHTML = '';

  const cards = [
    ['Host', state.system.hostname],
    ['Platform', state.system.platform],
    ['Node', state.system.node],
    ['Port', String(state.system.appPort)],
    ['Messages', String(state.system.metrics.messages)],
    ['Notes', String(state.system.metrics.notes)],
    ['Models', String(state.system.metrics.staffModels)],
    ['Git', `${state.system.git.branch} · ${state.system.git.commit}`],
  ];

  cards.forEach(([label, value]) => {
    const item = document.createElement('div');
    item.className = 'system-card';
    item.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    els.systemStatus.appendChild(item);
  });
}

function renderNotes() {
  els.noteList.innerHTML = '';
  if (!state.notes.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No notes yet.';
    els.noteList.appendChild(empty);
    return;
  }

  state.notes.forEach((note) => {
    const item = document.createElement('article');
    item.className = 'note-card';
    item.innerHTML = `
      <div class="note-meta">
        <strong>${note.title}</strong>
        <span>${note.noteType}</span>
      </div>
      <p>${note.body}</p>
      <div class="muted small">${note.author} · ${formatTime(note.createdAt)}</div>
    `;
    els.noteList.appendChild(item);
  });
}

function formatTime(value) {
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function loadIdentity() {
  try {
    const saved = JSON.parse(localStorage.getItem('pillar.identity') || '{}');
    return {
      name: saved.name || 'Atlas',
      role: saved.role || 'Atlas',
    };
  } catch {
    return { name: 'Atlas', role: 'Atlas' };
  }
}
