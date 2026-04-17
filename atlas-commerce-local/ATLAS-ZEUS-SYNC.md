# Atlas / Zeus shared sync

## Purpose
This file is a shared working sync surface so Atlas and Zeus can stay aligned on the ecommerce prototype without context drift.

## Canonical project direction
- runtime target: desktop-local machine
- backend: Django
- language: Python
- database: SQLite
- frontend: existing frontend code
- editor target: VS Code
- portability target: USB-copyable project folder
- Node.js is frontend tooling only unless Architect explicitly changes direction
- XAMPP/PHP is not the target runtime for the canonical prototype

## Canonical local project root
Target desktop path:
- `C:\Projects\ecommerce-prototype\`

Canonical workspace scaffold here:
- `/root/.openclaw/workspace/atlas-commerce-local`

## Coordination rule
If alternate experiments exist, they must not replace canonical direction unless Architect explicitly approves a change.

That means:
- Django/SQLite desktop-local remains the main line
- any Node-based backend variant must be treated as a separate comparison sandbox, not the default target
- public server preview work is temporary review infrastructure, not the long-term architecture

## Current known temporary public review lane
Temporary review surface already exists separately at:
- `https://atlasarchitect.ai/ecommerce-local/app/`

This should be treated as a reference/demo lane, not the canonical final runtime.

## Current highest-value implementation focus
Turn the desktop-local scaffold into the real source of truth by building the minimal Django domain and API layer for:
- users
- products
- cart
- orders
- dashboard

Then map the existing frontend onto that cleanly.

## Sync behavior
- use this file plus the Zeus context briefs as shared state
- keep architecture guidance consistent with desktop-local Django
- avoid suggesting Node backend / XAMPP backend as default unless Architect explicitly changes course
- prefer concrete implementation notes over abstract discussion
