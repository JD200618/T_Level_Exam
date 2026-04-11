# Pillar Dashboard

A shared dashboard for Architect, Atlas, staff models, and future agents.

## What it does
- HTTPS via Caddy reverse proxy
- Login with session auth
- Role-based permissions for owner and staff
- Real-time room-based communication with Socket.IO
- Persistent message, task, note, and staff-state storage with SQLite
- Staff model directory with active, asleep, and off states
- Server, git, and workspace data source panels
- Notes panel for decisions, risks, and approval asks

## Run it
```bash
cd dashboard
npm install
npm start
```

By default the app listens on `http://localhost:3210`, and Caddy can proxy it publicly over HTTPS.

To change the port:
```bash
PORT=4000 npm start
```

## Current rooms
- General
- Architect
- Ops
- Build

## Seed credentials
On first boot, generated credentials are written to:

```bash
/root/.openclaw/workspace/dashboard/data/bootstrap-credentials.json
```

## Suggested next steps
- Add user management and password rotation
- Add file uploads
- Connect more external data sources
- Add notifications and digests
- Add agent wake / sleep orchestration hooks
