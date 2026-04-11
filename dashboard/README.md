# Pillar Dashboard

A shared dashboard for Architect, Atlas, staff models, and future agents.

## What it does
- Real-time room-based communication with Socket.IO
- Persistent message and note storage with SQLite
- Staff model directory
- Server and git status panel
- Notes panel for decisions, risks, and approval asks

## Run it
```bash
cd dashboard
npm install
npm start
```

By default it listens on `http://localhost:3210`.

To change the port:
```bash
PORT=4000 npm start
```

## Current rooms
- General
- Architect
- Ops
- Build

## Suggested next steps
- Add authentication
- Add file uploads
- Add project/task tracking
- Add role-based permissions
- Put it behind a reverse proxy and domain
