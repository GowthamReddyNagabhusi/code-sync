# CodeSync ⚡

> Real-time collaborative coding in your browser with conflict-free editing, isolated Docker sandboxes, and Google Gemini AI assistance.

[![CI/CD Status](https://github.com/GowthamReddyNagabhusi/code-sync/actions/workflows/deploy.yml/badge.svg)](https://github.com/GowthamReddyNagabhusi/code-sync/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## What is CodeSync?

Remote pair programming, technical interviews, and mentoring sessions often suffer from messy screen sharing, copy-pasting code snippets, and environment discrepancies.

**CodeSync** gives you a lightweight, disposable collaborative coding room in seconds:
- **Simultaneous pair-programming** powered by Conflict-free Replicated Data Types (CRDT / RGA) and WebSockets with live cursor tracking.
- **Isolated Docker execution** for Java 21, Python 3.12, and C++ 20 inside ephemeral containers with CPU, memory, and network limits.
- **Gemini AI Co-Pilot** for code reviews, runtime bug detection, asymptotic complexity analysis, and gentle hints.
- **Instant access** with 8-character room codes — share the code and start coding together.

---

## Quickstart

### Prerequisites
- **Java 21+** and **Node.js 20+**
- **Docker & Docker Compose**

### 1. Start PostgreSQL & Redis
```bash
docker compose up -d
```
Starts PostgreSQL on port `5433` and Redis on port `6379`.

### 2. Start the Spring Boot Backend
```bash
cd codesync-backend
./mvnw spring-boot:run
```
*(On Windows PowerShell: `.\mvnw.cmd spring-boot:run`)*  
The backend starts on `http://localhost:8080`.

### 3. Start the Frontend
In a separate terminal:
```bash
cd codesync-frontend
npm install
npm run dev
```
Open **http://localhost:5173** to start coding.

---

## Core Features

- **Conflict-Free Collaboration**: Raw WebSockets combined with an RGA (Replicated Growable Array) CRDT engine ensure keystrokes merge smoothly without race conditions or dropped characters.
- **Multi-Server Redis Pub/Sub**: Redis coordinates WebSocket messages across horizontally scaled backend instances, ensuring users in the same room always stay in sync.
- **True Docker Sandboxing**: Untrusted code compiles and runs inside ephemeral Docker containers constrained with:
  - `--network none` (zero outbound/inbound network access)
  - `--memory 256m` (hard cgroup memory limit)
  - `--cpus 1.0` (CPU quota)
  - `--pids-limit 64` (fork-bomb guard)
  - `--rm` (automatic container cleanup on exit)
- **Built-in Gemini AI Co-Pilot**: Integrated with Google Gemini 3.8 Flash to review code structure, pinpoint potential runtime bugs, evaluate Big-O complexity, and offer hints.
- **Modern UI**: Dark obsidian palette, frosted glass navigation, tabbed sidebar, and interactive Monaco editor.

---

## Tech Stack

```
Frontend:   React 19, Vite, Monaco Editor, Lucide Icons, React Markdown
Backend:    Spring Boot 3.5, Java 21, Spring Security, Spring AI
Data:       PostgreSQL 16 (user/room metadata), Redis 7 (WebSocket Pub/Sub)
Sandbox:    Docker Engine (Java 21, Python 3.12, GCC/G++ 13)
Cloud:      AWS ECS Fargate, S3, Application Load Balancer, Secrets Manager
```

---

## Architecture

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
      │  - Redis Pub/Sub Dispatcher        │
      │  - Spring AI Gemini Gateway        │
      └─────────┬────────────────┬─────────┘
                │                │
        ┌───────┴──────┐   ┌─────┴────────────────┐
        ▼              ▼   ▼                      ▼
   PostgreSQL 16    Redis 7        Docker Sandbox Daemon
   (User & Rooms)  (Pub/Sub)   (Isolated Runner Containers)
```

---

## Configuration & Environment Variables

Copy `.env.example` to `.env` to customize your environment:

| Variable | Target | Purpose | Default |
|:---------|:-------|:--------|:--------|
| `VITE_API_URL` | Frontend | Backend API & WebSocket URL | `http://localhost:8080` |
| `DB_HOST` | Backend | PostgreSQL hostname | `localhost` |
| `DB_PORT` | Backend | PostgreSQL port | `5433` |
| `DB_NAME` | Backend | Database name | `codesync` |
| `REDIS_HOST` | Backend | Redis hostname | `localhost` |
| `REDIS_PORT` | Backend | Redis port | `6379` |
| `JWT_SECRET` | Backend | HMAC SHA-256 JWT signing secret | Local dev secret |
| `GEMINI_API_KEY`| Backend | Google AI Studio API key | Configured via `.env` |
| `AI_MODEL` | Backend | Model identifier | `gemini-3.8-flash` |

---

## API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account (`username`, `email`, `password`)
- `POST /api/auth/login` — Sign in and receive a JWT Bearer token

### Room Management (`/api/rooms`)
- `POST /api/rooms` — Create a room (`name`, `language`, `maxMembers`)
- `GET /api/rooms` — List rooms joined or owned by current user
- `GET /api/rooms/{code}` — Fetch room metadata and participant list
- `POST /api/rooms/{code}/join` — Join a room by 8-character code
- `DELETE /api/rooms/{code}/leave` — Leave an active room
- `DELETE /api/rooms/{code}` — Delete a room (room owner only)

### Execution & AI (`/api/execute`, `/api/ai`)
- `POST /api/execute` — Run code in Docker sandbox (`code`, `language`, `stdin`)
- `POST /api/ai/review` — Request automated code quality review
- `POST /api/ai/bugs` — Scan code for bugs and edge cases
- `POST /api/ai/complexity` — Compute Big-O time and space complexity
- `POST /api/ai/hint` — Request a guided, non-spoiler hint

### Real-Time WebSocket
```
ws://localhost:8080/ws/editor?token=<JWT>&roomCode=<ROOM_CODE>
```
Supported wire messages:
- `SYNC_REQUEST` / `SYNC_RESPONSE`: Reconcile editor state on connection.
- `EDIT`: Broadcast document updates to peer collaborators and Redis.
- `USER_JOINED` / `USER_LEFT`: Real-time participant presence.
- `CURSOR_MOVE`: Live collaborator cursor tracking.

---

## License

This project is licensed under the MIT License.
