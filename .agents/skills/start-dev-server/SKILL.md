---
name: start-dev-server
description: >-
  Starts the Vite development server in the background and reports the local URL to the user. Use when the user asks to "start the dev server" or similar.
---

# Start Dev Server

## Overview
This skill spins up the local Vite development server for the Antigravity CAD project as a background task. It explicitly uses the correct Node.js paths for Windows and does not block the agent's execution loop.

## Dependencies
None

## Quick Start
If the user says "Start the dev server", execute this workflow immediately.

## Workflow

### 1. Launch the Server
Execute the `run_command` tool with the following parameters:
- `CommandLine`: `$env:PATH = "C:\Program Files\nodejs;" + $env:PATH; npm run dev`
- `Cwd`: The project root directory.
- `WaitMsBeforeAsync`: `3000` (Give it 3 seconds to either start or fail immediately).

### 2. Verify Success
Check the output returned by the `run_command` tool.
- If the command fails (e.g., exit code > 0 or obvious errors like "port already in use"), **fail loudly**. Report the exact error message to the user and do NOT attempt to automatically fix it or kill the occupying process.
- If the command successfully goes to the background (or outputs "VITE ready"), proceed to Step 3.

### 3. Report to User
Inform the user that the development server has been started and is available at `http://localhost:5173/`. 

## Common Mistakes
- **Forgetting the Path**: Do not run `npm run dev` by itself, as the Windows environment may lack the `npm` binary in the default PATH. Always prepend `$env:PATH = "C:\Program Files\nodejs;" + $env:PATH;`.
- **Blocking the Agent**: Do not use a high `WaitMsBeforeAsync` or try to read the log indefinitely. Once the command is pushed to the background, your job is done.
