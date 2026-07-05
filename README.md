# CodeSync — Real-Time Collaborative Coding Platform

[![Deploy to AWS](https://github.com/GowthamReddyNagabhusi/code-sync/actions/workflows/deploy.yml/badge.svg)](https://github.com/GowthamReddyNagabhusi/code-sync/actions/workflows/deploy.yml)

A production-deployed, real-time collaborative code editor with multi-language sandboxed execution and AI-powered code assistance.

🌐 **Live Demo:** [http://codesync-frontend-649424354235.s3-website.ap-south-1.amazonaws.com](http://codesync-frontend-649424354235.s3-website.ap-south-1.amazonaws.com)

---

## Features

- **Real-time collaboration** — Multiple users edit code simultaneously via WebSocket with instant sync
- **Multi-language execution** — Run Java, Python, and C++ in isolated Docker containers
- **Room management** — Create or join coding rooms with shareable room codes
- **AI Assistant** — Code review, bug detection, complexity analysis, and hints powered by GPT-4o
- **Live cursor tracking** — See teammates' cursor positions in the editor
- **JWT Authentication** — Stateless, secure authentication with BCrypt password hashing

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Monaco Editor, React Router v6 |
| **Backend** | Spring Boot 3.x, Java 21 |
| **Auth** | JWT (jjwt 0.12.3), BCrypt |
| **Database** | PostgreSQL 16 |
| **Cache / PubSub** | Redis 7 |
| **Realtime** | Raw WebSocket + CRDT infrastructure (RGA algorithm) |
| **Execution** | Sandboxed Docker containers (Java / Python / C++) |
| **AI** | Spring AI + OpenAI GPT-4o |

---

## Architecture

```
Internet
    │
    ▼
Amazon S3 (React SPA, static hosting)
    │  REST + WebSocket
    ▼
Application Load Balancer  (public subnets, port 80)
    │  port 8080
    ▼
ECS Fargate (Spring Boot container, private subnets)
    │                     │
    ▼                     ▼
Amazon RDS           ElastiCache Redis
PostgreSQL 16        (WebSocket pub/sub)
```

### Module Structure

```
codesync-backend/src/main/java/com/codesync/
├── common/                     # Shared DTOs, exceptions, global error handler
├── config/                     # Security, CORS, WebSocket, Redis config
└── module/
    ├── auth/                   # JWT filter, login, register, BCrypt
    ├── user/                   # User profile management
    ├── room/                   # Room creation, join, leave, membership
    ├── editor/                 # Real-time WebSocket handler, CRDT, Redis pub/sub
    ├── execution/              # Docker sandbox, multi-language strategy pattern
    └── ai/                     # OpenAI GPT-4o code analysis
```

---

## Local Development

### Prerequisites

- Java 21+
- Node.js 22+
- Docker & Docker Compose

### 1. Start local infrastructure

```bash
docker-compose up -d
```

This starts PostgreSQL (port 5433) and Redis (port 6379) locally.

### 2. Run the backend

```bash
cd codesync-backend
./mvnw spring-boot:run
```

The backend uses environment variable fallbacks — no `.env` file needed locally:
- `DB_HOST` → `localhost`
- `DB_PORT` → `5433`
- `DB_NAME` → `codesync`
- `DB_USERNAME` / `DB_PASSWORD` → `postgres` / `postgres`

### 3. Run the frontend

```bash
cd codesync-frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## API Reference

### Auth — `/api/auth`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login & get JWT |

### Users — `/api/users`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/me` | JWT | Get profile |
| PUT | `/api/users/me` | JWT | Update profile |

### Rooms — `/api/rooms`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/rooms` | JWT | Create room |
| GET | `/api/rooms` | JWT | List my rooms |
| GET | `/api/rooms/{code}` | JWT | Get room by code |
| POST | `/api/rooms/{code}/join` | JWT | Join room |
| DELETE | `/api/rooms/{code}/leave` | JWT | Leave room |
| DELETE | `/api/rooms/{code}` | JWT | Delete room (owner only) |

### Code Execution — `/api/execute`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/execute` | JWT | Run code (java / python / cpp) |

### AI Assistant — `/api/ai`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/ai/review` | JWT | Code review |
| POST | `/api/ai/bugs` | JWT | Bug detection |
| POST | `/api/ai/complexity` | JWT | Complexity analysis |
| POST | `/api/ai/hint` | JWT | Coding hint |

### WebSocket
```
ws://<backend-host>/ws/editor?token=<JWT>&roomCode=<ROOM_CODE>
```

---

## Environment Variables

All sensitive values are injected at runtime via AWS Secrets Manager in production. For local development, safe defaults are used.

| Variable | Description | Local Default |
|----------|-------------|---------------|
| `DB_HOST` | PostgreSQL hostname | `localhost` |
| `DB_PORT` | PostgreSQL port | `5433` |
| `DB_NAME` | Database name | `codesync` |
| `DB_USERNAME` | DB user | `postgres` |
| `DB_PASSWORD` | DB password | `postgres` |
| `REDIS_HOST` | Redis hostname | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | JWT signing secret | `local-dev-secret-change-in-production` |
| `JWT_EXPIRATION` | Token TTL (ms) | `86400000` (24h) |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:5173,http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID | `placeholder` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret | `placeholder` |
| `GITHUB_CLIENT_ID` | GitHub OAuth2 client ID | `placeholder` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth2 client secret | `placeholder` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-placeholder` |

---

## Production Deployment (AWS)

The project is deployed on AWS using ECS Fargate (backend) and S3 static website hosting (frontend). Full deployment instructions are in [`deploy/README.md`](deploy/README.md).

### CI/CD

Every push to `main` automatically:
1. **Builds** the Spring Boot Docker image and pushes it to Amazon ECR
2. **Deploys** a rolling update to ECS Fargate (waits for service stability)
3. **Builds** the React frontend with Vite and syncs it to S3

Authentication to AWS uses **OIDC federation** — no long-lived AWS credentials are stored in GitHub Secrets.

### Infrastructure at a Glance

| Component | Service |
|-----------|---------|
| Container runtime | ECS Fargate (private subnets) |
| Container registry | Amazon ECR |
| Load balancer | Application Load Balancer (public subnets) |
| Database | Amazon RDS PostgreSQL 16 (private subnet) |
| Cache | Amazon ElastiCache Redis 7 (private subnet) |
| Frontend hosting | Amazon S3 static website |
| Secrets | AWS Secrets Manager |
| Logs | Amazon CloudWatch Logs |
| CI/CD | GitHub Actions + OIDC |

---

## Docker Runner Images

The `docker/` directory contains Dockerfiles for sandboxed code execution:

| Image | Language | Location |
|-------|----------|----------|
| `java-runner` | Java 21 | `docker/java-runner/Dockerfile` |
| `python-runner` | Python 3 | `docker/python-runner/Dockerfile` |
| `cpp-runner` | GCC/C++ | `docker/cpp-runner/Dockerfile` |

Each execution runs in a fresh, isolated container with CPU and memory limits.

---

## Health Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/actuator/health` | Overall health (DB + Redis status) |
| `/actuator/health/readiness` | Ready to serve traffic (used by ALB) |
| `/actuator/health/liveness` | JVM is alive (used by ECS) |
