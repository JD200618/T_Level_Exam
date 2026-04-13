const state = {
  user: null,
  siteContext: null,
  activePage: 'overview',
  rooms: [],
  activeRoom: 'general',
  messages: [],
  notes: [],
  tasks: [],
  activityState: null,
  activityEvents: [],
  staffModels: [],
  system: null,
  opsSnapshot: null,
  dataSources: [],
  dashboardModel: null,
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
  activityState: document.querySelector('#activityState'),
  activityFeed: document.querySelector('#activityFeed'),
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
  overviewTitle: document.querySelector('#overviewTitle'),
  overviewDescription: document.querySelector('#overviewDescription'),
  overviewFocus: document.querySelector('#overviewFocus'),
  overviewDetail: document.querySelector('#overviewDetail'),
  overviewMetrics: document.querySelector('#overviewMetrics'),
  pageNav: document.querySelector('#pageNav'),
  operationalStage: document.querySelector('#operationalStage'),
  operationalSummary: document.querySelector('#operationalSummary'),
  capabilityMatrix: document.querySelector('#capabilityMatrix'),
  gainedCapabilities: document.querySelector('#gainedCapabilities'),
  topologyNodes: document.querySelector('#topologyNodes'),
  topologyEdges: document.querySelector('#topologyEdges'),
  workflowGraph: document.querySelector('#workflowGraph'),
  lineageEntities: document.querySelector('#lineageEntities'),
  lineageRelations: document.querySelector('#lineageRelations'),
  telemetryPanels: document.querySelector('#telemetryPanels'),
  infraNetworkPanels: document.querySelector('#infraNetworkPanels'),
  pillarGrid: document.querySelector('#pillarGrid'),
  agentOperations: document.querySelector('#agentOperations'),
  backendCards: document.querySelector('#backendCards'),
  mlSummary: document.querySelector('#mlSummary'),
  mlLayerGrid: document.querySelector('#mlLayerGrid'),
  modelRegistry: document.querySelector('#modelRegistry'),
  progressChartSections: document.querySelector('#progressChartSections'),
  chartGuide: document.querySelector('#chartGuide'),
};

const socket = io();
let dashboardRefreshQueued = false;

wireEvents();
checkSession();
window.setInterval(() => {
  if (state.user) refreshDashboardModel();
}, 30000);

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
  state.activityState = data.activityState;
  state.activityEvents = data.activityEvents;
  state.staffModels = data.staffModels;
  state.system = data.system;
  state.opsSnapshot = data.opsSnapshot;
  state.dataSources = data.dataSources;
  state.dashboardModel = data.dashboardModel;
  renderAll();
}

async function refreshDashboardModel() {
  if (!state.user) return;

  try {
    const response = await fetch('/api/dashboard');
    if (!response.ok) return;
    const data = await response.json();
    state.dashboardModel = data.dashboardModel;
    renderDashboard();
  } catch {
    // Keep the current rendered state if the refresh fails.
  }
}

function queueDashboardRefresh() {
  if (dashboardRefreshQueued || !state.user) return;
  dashboardRefreshQueued = true;
  window.setTimeout(async () => {
    dashboardRefreshQueued = false;
    await refreshDashboardModel();
  }, 120);
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
    queueDashboardRefresh();
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
    queueDashboardRefresh();
  });

  socket.on('task:updated', (task) => {
    const index = state.tasks.findIndex((entry) => entry.id === task.id);
    if (index >= 0) state.tasks[index] = task;
    else state.tasks.unshift(task);
    renderTasks();
    queueDashboardRefresh();
  });

  socket.on('activity:state', ({ activityState, activityEvents }) => {
    state.activityState = activityState;
    state.activityEvents = activityEvents;
    renderActivity();
    queueDashboardRefresh();
  });

  socket.on('staff:updated', (staffModels) => {
    state.staffModels = staffModels;
    renderStaff();
    populateAssigneeOptions();
    queueDashboardRefresh();
  });

  socket.on('system:status', (system) => {
    state.system = system;
    queueDashboardRefresh();
  });

  socket.on('system:hello', ({ system }) => {
    state.system = system;
    queueDashboardRefresh();
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
  renderActivity();
  renderStaff();
  renderTasks();
  renderNotes();
  populateAssigneeOptions();
  renderDashboard();
}

function renderDashboard() {
  renderPageNav();
  renderOverview();
  renderOperationalLevel();
  renderTopology();
  renderWorkflowGraph();
  renderLineage();
  renderTelemetryPlane();
  renderInfrastructurePlane();
  renderPillars();
  renderAgentOperations();
  renderBackendCards();
  renderMlSystem();
  renderAnalytics();
  applyPageSections();
}

function renderPageNav() {
  if (!els.pageNav) return;
  els.pageNav.innerHTML = '';

  const pages = [
    ['overview', 'Overview'],
    ['operations', 'Operations'],
    ['workflows', 'Workflows'],
    ['agents', 'Agents'],
    ['intelligence', 'Models/Data'],
    ['data', 'Lineage'],
    ['infrastructure', 'Infra'],
  ];

  pages.forEach(([id, label]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `page-button ${state.activePage === id ? 'active' : ''}`;
    button.textContent = label;
    button.addEventListener('click', () => {
      state.activePage = id;
      renderPageNav();
      applyPageSections();
    });
    els.pageNav.appendChild(button);
  });
}

function applyPageSections() {
  document.querySelectorAll('[data-page-section]').forEach((section) => {
    const visible = section.getAttribute('data-page-section') === state.activePage;
    section.classList.toggle('page-section-hidden', !visible);
  });
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
    button.innerHTML = `<strong>${escapeHtml(room.label)}</strong><span>${escapeHtml(room.description || '')}</span>`;
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

function renderActivity() {
  els.activityState.innerHTML = '';
  els.activityFeed.innerHTML = '';

  if (state.activityState) {
    const stateCard = document.createElement('article');
    stateCard.className = 'data-source-card';
    stateCard.innerHTML = `
      <div class="note-meta">
        <strong>${escapeHtml(state.activityState.actor)}</strong>
        <span class="pill ${statusClass(state.activityState.status)}">${escapeHtml(state.activityState.status)}</span>
      </div>
      <p><strong>${escapeHtml(state.activityState.focus)}</strong></p>
      <p>${escapeHtml(state.activityState.detail)}</p>
      <div class="muted small">Updated ${formatTime(state.activityState.updatedAt)}</div>
    `;
    els.activityState.appendChild(stateCard);
  } else {
    els.activityState.appendChild(emptyState('No activity state yet.'));
  }

  if (!state.activityEvents.length) {
    els.activityFeed.appendChild(emptyState('No activity events yet.'));
    return;
  }

  state.activityEvents.forEach((event) => {
    const item = document.createElement('article');
    item.className = 'note-card';
    item.innerHTML = `
      <div class="note-meta">
        <strong>${escapeHtml(event.title)}</strong>
        <span class="pill ${statusClass(event.status)}">${escapeHtml(event.status)}</span>
      </div>
      <p>${escapeHtml(event.detail)}</p>
      <div class="muted small">${escapeHtml(event.actor)} · ${escapeHtml(event.kind)} · ${formatTime(event.createdAt)}</div>
    `;
    els.activityFeed.appendChild(item);
  });
}

function renderStaff() {
  els.staffList.innerHTML = '';
  state.staffModels.forEach((staff) => {
    const card = document.createElement('article');
    card.className = 'staff-card';

    const controls = can('staff.manage')
      ? `
        <div class="button-row compact">
          <button data-staff-action="active" data-staff-id="${escapeHtml(staff.id)}" class="mini-button">Wake</button>
          <button data-staff-action="asleep" data-staff-id="${escapeHtml(staff.id)}" class="mini-button">Sleep</button>
          <button data-staff-action="off" data-staff-id="${escapeHtml(staff.id)}" class="mini-button danger">Off</button>
        </div>
      `
      : '';

    card.innerHTML = `
      <div class="staff-head">
        <strong>${escapeHtml(staff.name)}</strong>
        <span class="pill ${statusClass(staff.status)}">${escapeHtml(staff.status)}</span>
      </div>
      <p class="muted small">${escapeHtml(staff.category)} · ${escapeHtml(staff.lane)}</p>
      <p>${escapeHtml(staff.purpose)}</p>
      <p class="muted small">${escapeHtml(staff.stateNotes || '')}</p>
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
        <strong>${escapeHtml(task.title)}</strong>
        <span class="pill ${statusClass(task.status)}">${escapeHtml(task.status)}</span>
      </div>
      <p>${escapeHtml(task.description || 'No description.')}</p>
      <div class="muted small">Priority: ${escapeHtml(task.priority)} · Assignee: ${escapeHtml(assignee?.name || 'Unassigned')} · ${formatTime(task.updatedAt)}</div>
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
        <strong>${escapeHtml(note.title)}</strong>
        <span>${escapeHtml(note.noteType)}</span>
      </div>
      <p>${escapeHtml(note.body)}</p>
      <div class="muted small">${escapeHtml(note.author)} · ${formatTime(note.createdAt)}</div>
    `;
    els.noteList.appendChild(item);
  });
}

function renderOverview() {
  const overview = state.dashboardModel?.overview;
  els.overviewTitle.textContent = overview?.title || 'Operations surface';
  els.overviewDescription.textContent = overview?.description || 'Structured view of command, backend, data/ML, and delivery.';
  els.overviewFocus.textContent = overview?.focus || 'No active focus.';
  els.overviewDetail.textContent = overview?.detail || 'Waiting for operational detail.';
  els.overviewMetrics.innerHTML = '';

  if (!overview?.metrics?.length) {
    els.overviewMetrics.appendChild(emptyState('No overview metrics available yet.'));
    return;
  }

  overview.metrics.forEach((metric) => {
    const card = document.createElement('article');
    card.className = 'metric-card';
    card.innerHTML = `<span>${escapeHtml(metric.label)}</span><strong>${escapeHtml(metric.value)}</strong>`;
    els.overviewMetrics.appendChild(card);
  });
}

function renderOperationalLevel() {
  const operationalLevel = state.dashboardModel?.operationalLevel;
  els.operationalStage.innerHTML = '';
  els.operationalSummary.innerHTML = '';
  els.capabilityMatrix.innerHTML = '';
  els.gainedCapabilities.innerHTML = '';

  if (!operationalLevel) {
    els.operationalStage.appendChild(emptyState('No operational level available yet.'));
    return;
  }

  els.operationalStage.innerHTML = `
    <span>Operational maturity</span>
    <strong>${escapeHtml(operationalLevel.stage)}</strong>
    <div class="operational-score-row">
      <div class="operational-score-track">
        <span class="operational-score-fill" style="width:${Math.max(6, Number(operationalLevel.score || 0))}%"></span>
      </div>
      <b>${escapeHtml(String(operationalLevel.score))}/100</b>
    </div>
  `;

  els.operationalSummary.innerHTML = `
    <span>Current posture</span>
    <strong>${escapeHtml(operationalLevel.summary)}</strong>
    <p class="muted small">${escapeHtml(operationalLevel.detail)}</p>
  `;

  (operationalLevel.capabilities || []).forEach((capability) => {
    const card = document.createElement('article');
    card.className = 'capability-card';
    card.innerHTML = `
      <div class="note-meta">
        <strong>${escapeHtml(capability.label)}</strong>
        <span>${escapeHtml(String(capability.score))}/100</span>
      </div>
      <p class="muted small">${escapeHtml(capability.detail)}</p>
      <div class="progress-track capability-track">
        <span class="progress-bar ${statusClass(capability.status || 'info')}" style="width:${Math.max(6, Number(capability.score || 0))}%"></span>
      </div>
    `;
    els.capabilityMatrix.appendChild(card);
  });

  (operationalLevel.gains || []).forEach((gain) => {
    const card = document.createElement('article');
    card.className = 'gain-card';
    card.innerHTML = `
      <div class="note-meta">
        <strong>${escapeHtml(gain.label)}</strong>
        <span class="pill ${statusClass(gain.status || 'info')}">${escapeHtml(gain.status || 'info')}</span>
      </div>
      <p>${escapeHtml(gain.detail)}</p>
    `;
    els.gainedCapabilities.appendChild(card);
  });
}

function renderTopology() {
  const topology = state.dashboardModel?.topology;
  els.topologyNodes.innerHTML = '';
  els.topologyEdges.innerHTML = '';

  if (!topology?.nodes?.length) {
    els.topologyNodes.appendChild(emptyState('No topology nodes available yet.'));
    return;
  }

  topology.nodes.forEach((node) => {
    const card = document.createElement('article');
    card.className = 'topology-node';
    card.innerHTML = `
      <div class="note-meta">
        <strong>${escapeHtml(node.label)}</strong>
        <span class="pill ${statusClass(node.status || 'info')}">${escapeHtml(node.status || 'info')}</span>
      </div>
      <p class="muted small">${escapeHtml(node.kind)}</p>
      <p>${escapeHtml(node.detail)}</p>
    `;
    els.topologyNodes.appendChild(card);
  });

  if (!topology.edges?.length) {
    els.topologyEdges.appendChild(emptyState('No dependency edges available yet.'));
    return;
  }

  topology.edges.forEach((edge) => {
    const item = document.createElement('article');
    item.className = 'edge-card';
    item.innerHTML = `
      <div class="note-meta">
        <strong>${escapeHtml(edge.from)} → ${escapeHtml(edge.to)}</strong>
        <span class="pill ${statusClass(edge.status || 'info')}">${escapeHtml(edge.status || 'info')}</span>
      </div>
      <p>${escapeHtml(edge.detail)}</p>
    `;
    els.topologyEdges.appendChild(item);
  });
}

function renderWorkflowGraph() {
  const workflowGraph = state.dashboardModel?.workflowGraph;
  els.workflowGraph.innerHTML = '';

  if (!workflowGraph?.steps?.length) {
    els.workflowGraph.appendChild(emptyState('No workflow graph available yet.'));
    return;
  }

  workflowGraph.steps.forEach((step, index) => {
    const card = document.createElement('article');
    card.className = 'workflow-step-card';
    card.innerHTML = `
      <div class="note-meta">
        <strong>${escapeHtml(step.label)}</strong>
        <span class="pill ${statusClass(step.status || 'info')}">${escapeHtml(step.status || 'info')}</span>
      </div>
      <p class="muted small">${escapeHtml(step.kind)}</p>
      <p>${escapeHtml(step.detail)}</p>
    `;
    els.workflowGraph.appendChild(card);

    if (index < workflowGraph.steps.length - 1) {
      const arrow = document.createElement('div');
      arrow.className = 'workflow-arrow';
      arrow.textContent = '→';
      els.workflowGraph.appendChild(arrow);
    }
  });
}

function renderLineage() {
  const lineage = state.dashboardModel?.lineage;
  els.lineageEntities.innerHTML = '';
  els.lineageRelations.innerHTML = '';

  if (!lineage?.entities?.length) {
    els.lineageEntities.appendChild(emptyState('No lineage entities available yet.'));
    return;
  }

  lineage.entities.forEach((entity) => {
    const card = document.createElement('article');
    card.className = 'lineage-card';
    card.innerHTML = `
      <div class="note-meta">
        <strong>${escapeHtml(entity.label)}</strong>
        <span class="pill ${statusClass(entity.status || 'info')}">${escapeHtml(entity.status || 'info')}</span>
      </div>
      <p class="muted small">${escapeHtml(entity.kind)}</p>
      <p>${escapeHtml(entity.detail)}</p>
    `;
    els.lineageEntities.appendChild(card);
  });

  if (!lineage?.relations?.length) {
    els.lineageRelations.appendChild(emptyState('No lineage relations available yet.'));
    return;
  }

  lineage.relations.forEach((relation) => {
    const item = document.createElement('article');
    item.className = 'edge-card';
    item.innerHTML = `
      <div class="note-meta">
        <strong>${escapeHtml(relation.from)} → ${escapeHtml(relation.to)}</strong>
        <span class="pill ${statusClass(relation.status || 'info')}">${escapeHtml(relation.status || 'info')}</span>
      </div>
      <p>${escapeHtml(relation.detail)}</p>
    `;
    els.lineageRelations.appendChild(item);
  });
}

function renderTelemetryPlane() {
  const telemetry = state.dashboardModel?.telemetryPlane;
  els.telemetryPanels.innerHTML = '';

  if (!telemetry?.panels?.length) {
    els.telemetryPanels.appendChild(emptyState('No telemetry panels available yet.'));
    return;
  }

  telemetry.panels.forEach((panel) => {
    const article = document.createElement('article');
    article.className = 'telemetry-card';
    article.innerHTML = `
      <div class="note-meta">
        <strong>${escapeHtml(panel.title)}</strong>
        <span class="pill ${statusClass(panel.status || 'info')}">${escapeHtml(panel.status || 'info')}</span>
      </div>
      <p class="muted small">${escapeHtml(panel.summary)}</p>
      <ul class="line-list">
        ${(panel.lines || []).map((line) => `<li>${escapeHtml(line)}</li>`).join('')}
      </ul>
    `;
    els.telemetryPanels.appendChild(article);
  });
}

function renderInfrastructurePlane() {
  const infrastructure = state.dashboardModel?.infrastructurePlane;
  els.infraNetworkPanels.innerHTML = '';

  if (!infrastructure?.panels?.length) {
    els.infraNetworkPanels.appendChild(emptyState('No infrastructure panels available yet.'));
    return;
  }

  infrastructure.panels.forEach((panel) => {
    const article = document.createElement('article');
    article.className = 'telemetry-card';
    article.innerHTML = `
      <div class="note-meta">
        <strong>${escapeHtml(panel.title)}</strong>
        <span class="pill ${statusClass(panel.status || 'info')}">${escapeHtml(panel.status || 'info')}</span>
      </div>
      <p class="muted small">${escapeHtml(panel.summary)}</p>
      <ul class="line-list">
        ${(panel.lines || []).map((line) => `<li>${escapeHtml(line)}</li>`).join('')}
      </ul>
    `;
    els.infraNetworkPanels.appendChild(article);
  });
}

function renderPillars() {
  els.pillarGrid.innerHTML = '';
  const pillars = state.dashboardModel?.pillars || [];
  if (!pillars.length) {
    els.pillarGrid.appendChild(emptyState('No pillars are defined yet.'));
    return;
  }

  pillars.forEach((pillar) => {
    const article = document.createElement('article');
    article.className = 'pillar-card';
    article.innerHTML = `
      <div class="note-meta">
        <div>
          <div class="eyebrow tight-eyebrow">${escapeHtml(pillar.label)}</div>
          <strong>${escapeHtml(pillar.title)}</strong>
        </div>
        <span class="pill ${statusClass(pillar.status)}">${escapeHtml(pillar.status)}</span>
      </div>
      <p class="muted small">Owner: ${escapeHtml(pillar.owner)}</p>
      <p>${escapeHtml(pillar.summary)}</p>
      <p class="muted">${escapeHtml(pillar.detail)}</p>
      <div class="mini-metric-grid">
        ${(pillar.metrics || [])
          .map(
            (metric) => `
              <div class="mini-metric">
                <span>${escapeHtml(metric.label)}</span>
                <strong>${escapeHtml(metric.value)}</strong>
              </div>
            `
          )
          .join('')}
      </div>
    `;
    els.pillarGrid.appendChild(article);
  });
}

function renderAgentOperations() {
  els.agentOperations.innerHTML = '';
  const agents = state.dashboardModel?.agentOperations || [];
  if (!agents.length) {
    els.agentOperations.appendChild(emptyState('No agent operations are available yet.'));
    return;
  }

  agents.forEach((agent) => {
    const article = document.createElement('article');
    article.className = 'agent-card';
    article.innerHTML = `
      <div class="note-meta">
        <strong>${escapeHtml(agent.name)}</strong>
        <span class="pill ${statusClass(agent.status)}">${escapeHtml(agent.status)}</span>
      </div>
      <p class="muted small">${escapeHtml(agent.category)} · ${escapeHtml(agent.lane)}</p>
      <p>${escapeHtml(agent.purpose)}</p>
      <div class="mini-metric-grid two-up">
        <div class="mini-metric"><span>Model</span><strong>${escapeHtml(agent.model || 'unknown')}</strong></div>
        <div class="mini-metric"><span>Route</span><strong>${escapeHtml(agent.routeSummary)}</strong></div>
        <div class="mini-metric"><span>Runtime</span><strong>${escapeHtml(agent.runtimeStatus || agent.status)}</strong></div>
        <div class="mini-metric"><span>Staff state</span><strong>${escapeHtml(agent.staffStatus || 'unknown')}</strong></div>
        <div class="mini-metric"><span>Workspace</span><strong>${escapeHtml(agent.workspace)}</strong></div>
        <div class="mini-metric"><span>Repo</span><strong>${escapeHtml(agent.branch)} · dirty ${escapeHtml(String(agent.dirtyCount))}</strong></div>
      </div>
      <div class="heartbeat-strip">
        <span class="pill ${statusClass(agent.runtimeStatus || agent.status)}">heartbeat ${escapeHtml(agent.runtimeStatus || agent.status)}</span>
        <span class="muted small">${escapeHtml(agent.heartbeat?.detail || 'No live heartbeat yet.')}</span>
      </div>
      <p class="muted small">Last role: ${escapeHtml(agent.heartbeat?.lastRole || 'unknown')} · Session: ${escapeHtml(agent.heartbeat?.sessionPath || 'none')}</p>
      <p class="muted small">${escapeHtml(agent.heartbeat?.preview || '')}</p>
      <p class="muted small">${escapeHtml(agent.stateNotes || '')}</p>
      <div class="memory-preview">
        <div class="memory-head">
          <strong>Latest memory</strong>
          <span>${escapeHtml(agent.latestMemory?.path || 'No memory file')}</span>
        </div>
        <p>${escapeHtml(agent.latestMemory?.preview || 'No preview available yet.')}</p>
      </div>
    `;
    els.agentOperations.appendChild(article);
  });
}

function renderBackendCards() {
  els.backendCards.innerHTML = '';
  const cards = state.dashboardModel?.backend?.cards || [];
  if (!cards.length) {
    els.backendCards.appendChild(emptyState('No backend cards available yet.'));
    return;
  }

  cards.forEach((card) => {
    const article = document.createElement('article');
    article.className = 'backend-card';
    article.innerHTML = `
      <div class="note-meta">
        <strong>${escapeHtml(card.title)}</strong>
        <span class="pill ${statusClass(card.status)}">${escapeHtml(card.status)}</span>
      </div>
      <ul class="line-list">
        ${(card.lines || []).map((line) => `<li>${escapeHtml(line)}</li>`).join('')}
      </ul>
    `;
    els.backendCards.appendChild(article);
  });
}

function renderMlSystem() {
  const mlSystem = state.dashboardModel?.mlSystem;
  els.mlSummary.textContent = mlSystem?.summary || 'No machine learning system summary available yet.';
  els.mlLayerGrid.innerHTML = '';
  els.modelRegistry.innerHTML = '';

  if (!mlSystem?.layers?.length) {
    els.mlLayerGrid.appendChild(emptyState('No ML layers available yet.'));
  } else {
    mlSystem.layers.forEach((layer) => {
      const article = document.createElement('article');
      article.className = 'ml-layer-card';
      article.innerHTML = `
        <div class="note-meta">
          <strong>${escapeHtml(layer.title)}</strong>
          <span class="pill ${statusClass(layer.status)}">${escapeHtml(layer.status)}</span>
        </div>
        <p class="muted small">${escapeHtml(layer.value)}</p>
        <p>${escapeHtml(layer.detail)}</p>
      `;
      els.mlLayerGrid.appendChild(article);
    });
  }

  if (!mlSystem?.models?.length) {
    els.modelRegistry.appendChild(emptyState('No model registry entries available yet.'));
    return;
  }

  mlSystem.models.forEach((model) => {
    const article = document.createElement('article');
    article.className = 'model-card';
    article.innerHTML = `
      <div class="note-meta">
        <strong>${escapeHtml(model.name)}</strong>
        <span class="pill ${statusClass(model.status)}">${escapeHtml(model.status)}</span>
      </div>
      <p class="muted small">${escapeHtml(model.lane)}</p>
      <p>${escapeHtml(model.purpose)}</p>
      <div class="mini-metric-grid two-up">
        <div class="mini-metric"><span>Model</span><strong>${escapeHtml(model.model)}</strong></div>
        <div class="mini-metric"><span>Route</span><strong>${escapeHtml(model.routeSummary)}</strong></div>
        <div class="mini-metric"><span>Runtime</span><strong>${escapeHtml(model.runtimeStatus || model.status)}</strong></div>
        <div class="mini-metric"><span>Staff</span><strong>${escapeHtml(model.staffStatus || 'unknown')}</strong></div>
        <div class="mini-metric"><span>Workspace</span><strong>${escapeHtml(model.workspace)}</strong></div>
        <div class="mini-metric"><span>Repo</span><strong>${escapeHtml(model.branch)} · dirty ${escapeHtml(String(model.dirtyCount))}</strong></div>
      </div>
      <div class="heartbeat-strip">
        <span class="pill ${statusClass(model.runtimeStatus || model.status)}">heartbeat ${escapeHtml(model.runtimeStatus || model.status)}</span>
        <span class="muted small">${escapeHtml(model.heartbeat?.detail || 'No live heartbeat yet.')}</span>
      </div>
      <p class="muted small">Last role: ${escapeHtml(model.heartbeat?.lastRole || 'unknown')} · Session: ${escapeHtml(model.heartbeat?.sessionPath || 'none')}</p>
      <p class="muted small">Memory: ${escapeHtml(model.memoryPath)}</p>
      <p class="muted small">${escapeHtml(model.notes || '')}</p>
    `;
    els.modelRegistry.appendChild(article);
  });
}

function renderAnalytics() {
  const analytics = state.dashboardModel?.analytics;
  els.progressChartSections.innerHTML = '';
  els.chartGuide.innerHTML = '';

  if (!analytics?.sections?.length) {
    els.progressChartSections.appendChild(emptyState('No visualization sections available yet.'));
  } else {
    analytics.sections.forEach((section) => {
      const total = Math.max(section.items.reduce((sum, item) => sum + Number(item.value || 0), 0), 1);
      const article = document.createElement('article');
      article.className = 'progress-card';
      article.innerHTML = `
        <div class="note-meta">
          <strong>${escapeHtml(section.title)}</strong>
          <span>${escapeHtml(section.chart)}</span>
        </div>
        <p class="muted small">${escapeHtml(section.reason)}</p>
        <div class="progress-stack">
          ${section.items
            .map((item) => {
              const width = Math.max(8, Math.round((Number(item.value || 0) / total) * 100));
              return `
                <div class="progress-row">
                  <div class="progress-label">
                    <span>${escapeHtml(item.label)}</span>
                    <strong>${escapeHtml(String(item.value))}</strong>
                  </div>
                  <div class="progress-track">
                    <span class="progress-bar ${statusClass(item.status || 'info')}" style="width:${width}%"></span>
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>
      `;
      els.progressChartSections.appendChild(article);
    });
  }

  if (!analytics?.guide?.length) {
    els.chartGuide.appendChild(emptyState('No chart guide entries available yet.'));
    return;
  }

  analytics.guide.forEach((entry) => {
    const article = document.createElement('article');
    article.className = 'chart-guide-card';
    article.innerHTML = `
      <div class="note-meta">
        <strong>${escapeHtml(entry.sector)}</strong>
        <span>${escapeHtml(entry.chart)}</span>
      </div>
      <p class="muted small">${escapeHtml(entry.mechanic)}</p>
      <p>${escapeHtml(entry.why)}</p>
    `;
    els.chartGuide.appendChild(article);
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

function statusClass(status) {
  const value = String(status || 'unknown').toLowerCase().replace(/\s+/g, '-');
  return value;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatTime(value) {
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
