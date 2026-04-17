# Zeus context sync

## Current true direction
This project is no longer centered on the server-side XAMPP/PHP path as the future target.
The target direction for the next phase is a **desktop-local prototype**.

## Required alignment
Zeus should align to all of the following:

1. Runtime target:
   - local desktop machine
   - not public server runtime
   - no public exposure of personal information

2. Stack direction:
   - backend: Django
   - language: Python
   - database: SQLite
   - editor: VS Code
   - frontend: existing frontend code
   - Node.js is only for frontend tooling when needed
   - do not treat XAMPP as the chosen core runtime for this prototype

3. Coding preference:
   - keep the code as simple as possible
   - use clear modular structure
   - avoid redundant code
   - shared/common reusable logic should live in common modules, not messy globals
   - use local functions only where scope is local to a module
   - use service-layer organization where it improves clarity

4. Portability:
   - project should be portable by USB to another desktop
   - use relative/local paths
   - keep runtime local
   - favor source + requirements + setup files + scripts over fragile machine-specific artifacts

5. Access reality:
   - direct desktop control is not active yet
   - Atlas may prepare structure here, but actual desktop execution still needs an access bridge or words-only setup on the user's machine

## Current prepared work
A desktop-local starter scaffold now exists at:
- `/root/.openclaw/workspace/atlas-commerce-local`

Notable commits:
- `90ee251` Scaffold desktop local Django prototype
- `171088c` Remove local dependency artifacts from desktop scaffold

## What Zeus should do now
- keep future guidance fully matched to this desktop-local Django direction
- avoid drifting back to XAMPP/PHP as the target runtime unless explicitly requested
- optimize for clarity, simplicity, portability, and local execution
- when giving architecture or coding guidance, assume this exact direction is canonical
