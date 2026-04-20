# Recommended local portability path

## Chosen direction
The best path for this project is **not** to hardcode away Python, Node.js, Django, or React. That would make the code less honest, harder to maintain, and less representative of real programming practice.

The chosen direction is:

- keep the project as readable source code
- keep the active frontend/backend split
- keep the real SQLite-backed behaviour
- reduce user friction through simple local scripts and clearer setup rules
- make the project runnable from any local folder on any desktop after a small bootstrap step

## Why this path fits the project
This project should show that the programmer understands:

- file structure
- backend vs frontend responsibilities
- local database use
- dependency management
- basic automation for setup and startup

If all dependencies were hidden behind hardcoded shortcuts, the project would look less believable as a real coded solution.

## What must stay true
To keep real functionality, the following layers still matter:

- Python runtime for the backend
- Node.js runtime for the frontend tooling
- project dependencies from `requirements.txt` and `package.json`
- SQLite database file generated locally

These are normal parts of a modern local application.

## What should be simplified instead
Rather than removing the real stack, the project should reduce user effort by:

- using a simple local folder structure
- keeping generated folders out of git
- recreating `.venv` and `node_modules` per machine instead of treating them as source code
- using startup/bootstrap scripts so the user does not have to remember many commands
- using readable documentation that explains what is source code and what is local machine setup

## Why runtime and generated folders exist
These folders are used to make the program run, but they are not the project logic itself.

### `backend/.venv/`
- keeps backend Python packages isolated to this project
- avoids conflicts with other Python projects on the same machine
- can be recreated on a new desktop

### `frontend/node_modules/`
- stores installed frontend packages used by the React/Vite app
- lets the frontend run and build locally
- can be recreated on a new desktop

### `__pycache__/`
- stores Python bytecode cache files to speed up repeated imports
- helps Python run a little faster locally
- is not needed in git and can be deleted safely because Python will recreate it

### `frontend/dist/`
- stores generated build output for the frontend
- is created from the real source code when the project is built
- is not the authored source code

### `backend/db.sqlite3`
- stores local database state and test/demo records
- is runtime data, not source code
- should stay local rather than be treated as the coded program itself

## Why machine-local support files exist
These files help a specific desktop run the project, but they should not be judged as the programmer's main work.

### `.env`
- keeps local configuration and secrets out of source code
- lets each desktop store its own local values safely

### activation and startup scripts
- reduce the number of commands the user has to remember
- make the setup more repeatable on a new desktop
- support the goal of a simpler local user experience

## What is not needed in git
These should stay out of the tracked deliverable repo whenever possible:

- `.venv/`
- `node_modules/`
- `__pycache__/`
- `*.pyc`
- `dist/`
- local `.env` files
- other cache or machine-local generated folders

## Languages used
### Back end
- Python
- Django and Django REST Framework are the main backend libraries/frameworks

### Front end
- TSX / TypeScript-style React components
- JavaScript runtime in the browser
- HTML structure through React components
- CSS for styling

### Database
- SQLite
- SQL is the underlying query language concept used by the database layer

## Practical rule
### Source code should stay portable
Portable project files include:

- `frontend/src/...`
- `backend/apps/...`
- `backend/config/...`
- `manage.py`
- `requirements.txt`
- `package.json`
- `docs/...`
- `scripts/...`

### Machine-local generated folders should be rebuilt
These should not be treated as portable source code:

- `backend/.venv/`
- `frontend/node_modules/`
- `__pycache__/`
- build output folders

## Recommended desktop workflow
### First time on a new desktop
1. Clone or copy the project to any local path.
2. Run the bootstrap script.
3. Start backend and frontend using the provided scripts.

### After first setup
The user should mostly use:

- `scripts\start-backend.cmd`
- `scripts\start-frontend.cmd`

This keeps the project simple without pretending the runtime does not exist.

## Final recommendation
The best-fitting path for this project is:

**readable source code + real local backend/database + lightweight bootstrap automation + machine-local dependency regeneration**

That keeps the system:

- understandable
- believable as programmed work
- portable across desktops
- simpler for the user to run repeatedly
