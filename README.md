# CodeSync ⚡

> Collaborative coding without the setup headache. Real-time pair programming, isolated Docker execution, and instant AI reviews in your browser.

[![CI/CD Status](https://github.com/GowthamReddyNagabhusi/code-sync/actions/workflows/deploy.yml/badge.svg)](https://github.com/GowthamReddyNagabhusi/code-sync/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Why does this exist?

Technical interviews, remote pair-programming, and mentoring sessions often turn into a mess of screen sharing, pasting code blocks into chat apps, and wrestling with "works on my machine" compiler mismatches.

**CodeSync** gives you and your team a disposable, collaborative workspace with zero setup:
- **Write code simultaneously** without stepping on each other's toes, powered by Conflict-free Replicated Data Types (CRDT / RGA algorithm).
- **Run Java, Python, and C++ directly in the browser** inside ephemeral, resource-constrained Docker containers.
- **Get unstuck fast** using built-in GPT-4o code reviews, bug detection, and complexity analysis.
- **Share a room with an 8-character code** — no lengthy onboarding, just share the link and start hacking.

---

## Quickstart: Run locally in 2 minutes

### Prerequisites
- **Java 21+** and **Node.js 22+**
- **Docker & Docker Compose**

### 1. Spin up Postgres & Redis
```bash
docker compose up -d
```
*Starts PostgreSQL on `localhost:5433` and Redis on `localhost:6379`.*

### 2. Start the Spring Boot backend
```bash
cd codesync-backend
./mvnw spring-boot:run
```
*(On Windows PowerShell: `.\mvnw.cmd spring-boot:run`)*  
The backend starts on `http://localhost:8080`. Safe local defaults are pre-configured, so you don't need to tweak environment variables for basic development.

### 3. Start the Vite React frontend
In a separate terminal window:
```bash
cd codesync-frontend
npm install
npm run dev
```
Visit **http://localhost:5173** and you're ready to code.

---

## Core Value Props

- **Conflict-Free Real-Time Collaboration**: Raw WebSockets combined with an RGA (Replicated Growable Array) CRDT engine ensure keystrokes merge seamlessly with zero character loss or race conditions.
- **Secure Sandboxed Execution**: Untrusted user code runs inside isolated, read-only Docker containers with CPU/memory limits and timeout watchdogs to prevent runaway processes.
- **Built-in AI Pair Programmer**: Ask GPT-4o to inspect your active buffer for algorithmic bugs, analyze asymptotic time/space complexity, or give a subtle hint when solving problems.
- **Clean Micro-Component Architecture**: Built with modular UI components, custom React hooks (`useWebSocketEditor`, `useCodeExecution`, `useAiAssistant`), and fully typed REST/WebSocket clients.

---

## Tech Stack

```
Frontend:   React 19, Vite, Monaco Editor, Lucide Icons, React Router v7
Backend:    Spring Boot 3.x, Java 21, Spring Security, Spring AI
Data:       PostgreSQL 16 (metadata/rooms), Redis 7 (WebSocket Pub/Sub)
Sandbox:    Docker Engine API (Java 21, Python 3.12, GCC/G++ 13)
Cloud:      AWS ECS Fargate, S3, Application Load Balancer, Secrets Manager
```

---

## Architecture at a Glance

```
       Browser Client (React + Monaco Editor)
                │              │
     REST (Auth, Rooms)   WebSocket (Real-Time Edits)
                │              │
                ▼              ▼
     ┌────────────────────────────────────┐
     │   Spring Boot 3 Core Service       │
     │  - JWT Auth & Security Filter      │
     │  - CRDT Document Reconciler        │
     │  - Spring AI GPT-4o Gateway        │
     └─────────┬────────────────┬─────────┘
               │                │
       ┌───────┴──────┐   ┌─────┴────────────────┐
       ▼              ▼   ▼                      ▼
  PostgreSQL 16    Redis 7        Docker Execution Daemon
  (User & Rooms)  (Pub/Sub)       (Isolated Sandbox Containers)
```

---

## Configuration & Environment Variables

Copy the provided sample files to configure your environment:
- Root template: [`.env.example`](.env.example)
- Frontend template: [`codesync-frontend/.env.example`](codesync-frontend/.env.example)
- Backend template: [`codesync-backend/.env.example`](codesync-backend/.env.example)

| Variable | Target | Purpose | Default |
|:---------|:-------|:--------|:--------|
| `VITE_API_URL` | Frontend | Backend HTTP / WebSocket base URL | `http://localhost:8080` |
| `DB_HOST` | Backend | PostgreSQL host | `localhost` |
| `DB_PORT` | Backend | PostgreSQL port | `5433` |
| `DB_NAME` | Backend | Database name | `codesync` |
| `REDIS_HOST` | Backend | Redis hostname | `localhost` |
| `REDIS_PORT` | Backend | Redis port | `6379` |
| `JWT_SECRET` | Backend | HMAC SHA-256 signing secret | `local-dev-secret-change-in-production` |
| `OPENAI_API_KEY` | Backend | OpenAI API key for AI assistant | Optional locally |

---

## REST & WebSocket API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account (`username`, `email`, `password`)
- `POST /api/auth/login` — Sign in and receive a bearer JWT

### Room Management (`/api/rooms`)
- `POST /api/rooms` — Create a room (`name`, `language`, `maxMembers`)
- `GET /api/rooms` — List rooms joined or owned by current user
- `GET /api/rooms/{code}` — Fetch room metadata and participant list
- `POST /api/rooms/{code}/join` — Join a room by 8-character code
- `DELETE /api/rooms/{code}/leave` — Leave an active room
- `DELETE /api/rooms/{code}` — Delete a room (room creator only)

### Execution & AI (`/api/execute`, `/api/ai`)
- `POST /api/execute` — Run code in Docker sandbox (`code`, `language`, `stdin`)
- `POST /api/ai/review` — Run automated code review
- `POST /api/ai/bugs` — Scan buffer for potential logic errors
- `POST /api/ai/complexity` — Compute Big-O time and memory complexity
- `POST /api/ai/hint` — Request a non-spoiler algorithmic hint

### Real-Time WebSocket
```
ws://localhost:8080/ws/editor?token=<JWT>&roomCode=<ROOM_CODE>
```
Supported wire messages:
- `SYNC_REQUEST` / `SYNC_RESPONSE`: Reconcile editor state on connection.
- `EDIT`: Broadcast document updates to peer collaborators.
- `USER_JOINED` / `USER_LEFT`: Real-time participant presence.
- `CURSOR_MOVE`: Live collaborator cursor tracking.

---

## Contributing

Pull requests are welcome!
1. Fork the repo and create your feature branch: `git checkout -b feat/my-feature`
2. Run linter and build tests before pushing:
   ```bash
   cd codesync-frontend
   npm run lint
   npm run build
   ```
3. Commit with concise messages and open a PR.
