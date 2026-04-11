const state = {
  user: null,
  siteContext: null,
  rooms: [],
  activeRoom: 'general',
  messages: [],
  notes: [],
  tasks: [],
  staffModels: [],
  system: null,
  dataSources: [],
};

const els = {
  loginOverlay: document.querySelector('#loginOverlay'),
  loginForm: document.querySelector('#loginForm'),
  loginUsername: document.querySelector('#loginUsername'),
  loginPassword: document.querySelector('#loginPassword'),
  loginError: document.querySelector('#loginError'),
  logoutButton: document.querySelector('#logoutButton'),
  siteName: document.querySelector('#siteName'),
  siteDescription: document.querySelector('#siteDescription'),
  sessionName: document.querySelector('#sessionName'),
  sessionRole: document.querySelector('#sessionRole'),
  roomList: document.querySelector('#roomList'),
  roomEyebrow: document.querySelector('#roomEyebrow'),
  roomTitle: document.querySelector('#roomTitle'),
  roomDescription: document.querySelector('#roomDescription'),
  connectionStatus: document.querySelector('#connectionStatus'),
  messageList: document.querySelector('#messageList'),
  messageForm: document.querySelector('#messageForm'),
  messageInput: document.querySelector('#messageInput'),
  staffList: document.querySelector('#staffList'),
  taskForm: document.querySelector('#taskForm'),
  taskTitle: document.querySelector('#taskTitle'),
  taskDescription: document.querySelector('#taskDescription'),
  taskPriority: document.querySelector('#taskPriority'),
  taskAssignee: document.querySelector('#taskAssignee'),
  taskList: document.querySelector('#taskList'),
  noteForm: document.querySelector('#noteForm'),
  noteTitle: document.querySelector('#noteTitle'),
  noteType: document.querySelector('#noteType'),
  noteBody: document.querySelector('#noteBody'),
  noteList: document.querySelector('#noteList'),
  dataSourceList: document.querySelector('#dataSourceList'),
  systemStatus: document.querySelector('#systemStatus'),
};

const socket = io();

wireEvents();
checkSession();

async function checkSession() {
  const response = await fetch('/api/auth/me');
  if (!response.ok) {
    showLogin(true);
    return;
  }
  const data = await response.json();
  state.user = data.user;
  showLogin(false);
  await bootstrap();
}

async function bootstrap(room = state.activeRoom) {
  const response = await fetch(`/api/bootstrap?room=${encodeURIComponent(room)}`);
  if (!response.ok) {
    showLogin(true);
    return;
  }

  const data = await response.json();
  state.user = data.user;
  state.siteContext = data.siteContext;
  state.rooms = data.rooms;
  state.activeRoom = data.activeRoom;
  state.messages = data.messages;
  state.notes = data.notes;
  state.tasks = data.tasks;
  state.staffModels = data.staffModels;
  state.system = data.system;
  state.dataSources = data.dataSources;
  renderAll();
}

function wireEvents() {
  els.loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    els.loginError.textContent = '';

    const payload = {
      username: els.loginUsername.value.trim(),
      password: els.loginPassword.value,
    };

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      els.loginError.textContent = data.error || 'Login failed.';
      return;
    }

    state.user = data.user;
    els.loginPassword.value = '';
    showLogin(false);
    await bootstrap();
  });

  els.logoutButton.addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    state.user = null;
    showLogin(true);
  });

  els.messageForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const body = els.messageInput.value.trim();
    if (!body) return;

    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: state.activeRoom, body }),
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

    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        body,
        noteType: els.noteType.value,
      }),
    });

    if (response.ok) {
      els.noteTitle.value = '';
      els.noteBody.value = '';
    }
  });

  els.taskForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const title = els.taskTitle.value.trim();
    if (!title) return;

    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description: els.taskDescription.value.trim(),
        priority: els.taskPriority.value,
        assigneeModelId: els.taskAssignee.value,
        roomId: state.activeRoom,
      }),
    });

    if (response.ok) {
      els.taskTitle.value = '';
      els.taskDescription.value = '';
      els.taskPriority.value = 'medium';
      els.taskAssignee.value = '';
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
  });

  socket.on('note:created', (note) => {
    state.notes.unshift(note);
    renderNotes();
  });

  socket.on('task:updated', (task) => {
    const index = state.tasks.findIndex((entry) => entry.id === task.id);
    if (index >= 0) state.tasks[index] = task;
    else state.tasks.unshift(task);
    renderTasks();
  });

  socket.on('staff:updated', (staffModels) => {
    state.staffModels = staffModels;
    renderStaff();
    populateAssigneeOptions();
  });

  socket.on('system:status', (system) => {
    state.system = system;
    renderSystem();
  });

  socket.on('system:hello', ({ system }) => {
    state.system = system;
    renderSystem();
  });
}

function showLogin(visible) {
  els.loginOverlay.classList.toggle('hidden', !visible);
  if (visible) {
    els.loginPassword.value = '';
    els.loginError.textContent = '';
    els.sessionName.textContent = 'Not signed in';
    els.sessionRole.textContent = '';
  }
}

async function changeRoom(roomId) {
  state.activeRoom = roomId;
  const response = await fetch(`/api/messages?room=${encodeURIComponent(roomId)}`);
  if (!response.ok) return;
  const data = await response.json();
  state.messages = data.messages;
  renderRooms();
  renderRoomHeader();
  renderMessages();
}

function renderAll() {
  renderSession();
  renderSiteContext();
  renderRooms();
  renderRoomHeader();
  renderMessages();
  renderStaff();
  renderTasks();
  renderNotes();
  renderDataSources();
  renderSystem();
  populateAssigneeOptions();
}

function renderSession() {
  els.sessionName.textContent = state.user?.displayName || 'Not signed in';
  els.sessionRole.textContent = state.user ? `${state.user.role} · ${state.user.username}` : '';
}

function renderSiteContext() {
  els.siteName.textContent = state.siteContext?.title || 'Atlas Operating Room';
  els.siteDescription.textContent = state.siteContext?.description || 'Shared communication, controlled runtime, and structured execution.';
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
    els.messageList.appendChild(emptyState('No messages yet. Start the room.'));
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

    const controls = can('staff.manage')
      ? `
        <div class="button-row compact">
          <button data-staff-action="active" data-staff-id="${staff.id}" class="mini-button">Wake</button>
          <button data-staff-action="asleep" data-staff-id="${staff.id}" class="mini-button">Sleep</button>
          <button data-staff-action="off" data-staff-id="${staff.id}" class="mini-button danger">Off</button>
        </div>
      `
      : '';

    card.innerHTML = `
      <div class="staff-head">
        <strong>${staff.name}</strong>
        <span class="pill ${staff.status}">${staff.status}</span>
      </div>
      <p class="muted small">${staff.category} · ${staff.lane}</p>
      <p>${staff.purpose}</p>
      <p class="muted small">${staff.stateNotes || ''}</p>
      ${controls}
    `;
    els.staffList.appendChild(card);
  });

  els.staffList.querySelectorAll('[data-staff-action]').forEach((button) => {
    button.addEventListener('click', async () => {
      const status = button.getAttribute('data-staff-action');
      const staffId = button.getAttribute('data-staff-id');
      await fetch(`/api/staff/${staffId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    });
  });
}

function populateAssigneeOptions() {
  els.taskAssignee.innerHTML = '<option value="">Unassigned</option>';
  state.staffModels.forEach((staff) => {
    const option = document.createElement('option');
    option.value = staff.id;
    option.textContent = `${staff.name} (${staff.status})`;
    els.taskAssignee.appendChild(option);
  });
}

function renderTasks() {
  els.taskList.innerHTML = '';
  if (!state.tasks.length) {
    els.taskList.appendChild(emptyState('No tasks yet.'));
    return;
  }

  state.tasks.forEach((task) => {
    const assignee = state.staffModels.find((staff) => staff.id === task.assigneeModelId);
    const actions = can('tasks.write')
      ? `
        <div class="button-row compact">
          <button data-task-status="backlog" data-task-id="${task.id}" class="mini-button">Backlog</button>
          <button data-task-status="active" data-task-id="${task.id}" class="mini-button">Active</button>
          <button data-task-status="blocked" data-task-id="${task.id}" class="mini-button">Blocked</button>
          <button data-task-status="done" data-task-id="${task.id}" class="mini-button success">Done</button>
        </div>
      `
      : '';

    const item = document.createElement('article');
    item.className = 'task-card';
    item.innerHTML = `
      <div class="note-meta">
        <strong>${task.title}</strong>
        <span class="pill ${task.status}">${task.status}</span>
      </div>
      <p>${task.description || 'No description.'}</p>
      <div class="muted small">Priority: ${task.priority} · Assignee: ${assignee?.name || 'Unassigned'} · ${formatTime(task.updatedAt)}</div>
      ${actions}
    `;
    els.taskList.appendChild(item);
  });

  els.taskList.querySelectorAll('[data-task-status]').forEach((button) => {
    button.addEventListener('click', async () => {
      const status = button.getAttribute('data-task-status');
      const taskId = button.getAttribute('data-task-id');
      const existing = state.tasks.find((task) => String(task.id) === taskId);
      if (!existing) return;

      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: existing.title,
          description: existing.description,
          priority: existing.priority,
          roomId: existing.roomId,
          assigneeModelId: existing.assigneeModelId || '',
          status,
        }),
      });
    });
  });
}

function renderNotes() {
  els.noteList.innerHTML = '';
  if (!state.notes.length) {
    els.noteList.appendChild(emptyState('No notes yet.'));
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

function renderDataSources() {
  els.dataSourceList.innerHTML = '';
  if (!state.dataSources.length) {
    els.dataSourceList.appendChild(emptyState('No data sources loaded.'));
    return;
  }

  state.dataSources.forEach((source) => {
    const item = document.createElement('article');
    item.className = 'data-source-card';
    item.innerHTML = `
      <div class="note-meta">
        <strong>${source.label}</strong>
        <span>${source.path}</span>
      </div>
      <pre>${source.preview}</pre>
      <div class="muted small">Updated ${formatTime(source.updatedAt)}</div>
    `;
    els.dataSourceList.appendChild(item);
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
    ['Tasks', String(state.system.metrics.tasks)],
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

function can(permission) {
  return Boolean(state.user?.permissions?.includes(permission));
}

function emptyState(message) {
  const empty = document.createElement('div');
  empty.className = 'empty-state';
  empty.textContent = message;
  return empty;
}

function formatTime(value) {
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
