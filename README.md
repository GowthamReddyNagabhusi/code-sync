# CodeSync — Collaborative Coding Platform

A real-time collaborative coding platform built with Spring Boot, featuring live code editing, sandboxed execution, and AI-powered assistance.

## Architecture

```
┌────────────────────────────────────────────────────┐
│                   CodeSync Backend                  │
├──────────┬──────────┬──────────┬─────────┬─────────┤
│   Auth   │  Rooms   │  Editor  │  Exec   │   AI    │
│  Module  │  Module  │  Module  │  Engine │ Assist  │
├──────────┴──────────┴──────────┴─────────┴─────────┤
│           Spring Boot 3.5 + Java 21                │
├────────────────────────────────────────────────────┤
│  PostgreSQL  │    Redis     │    Docker    │ OpenAI │
└──────────────┴──────────────┴─────────────┴────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Monaco Editor, React Router |
| Backend | Spring Boot 3.5.14, Java 21 |
| Auth | JWT (jjwt 0.12.3) + OAuth2 (Google/GitHub) |
| Database | PostgreSQL 16 |
| Cache/PubSub | Redis 7 |
| Realtime | Raw WebSocket + CRDT (RGA algorithm) |
| Execution | Docker containers (Java/Python/C++) |
| AI | Spring AI + OpenAI GPT-4o |

## Getting Started

### Prerequisites
- Java 21+
- Node.js 18+
- Docker & Docker Compose
- Maven 3.9+

### Run Infrastructure
```bash
docker-compose up -d
```

### Run Backend
```bash
cd codesync-backend
./mvnw spring-boot:run
```

### Run Frontend
```bash
cd codesync-frontend
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser.

### API Endpoints

#### Auth (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT |

#### Users (`/api/users`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get my profile |
| PUT | `/api/users/me` | Update profile |

#### Rooms (`/api/rooms`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/rooms` | Create room |
| GET | `/api/rooms` | List my rooms |
| GET | `/api/rooms/{code}` | Get room by code |
| POST | `/api/rooms/{code}/join` | Join room |
| DELETE | `/api/rooms/{code}/leave` | Leave room |
| DELETE | `/api/rooms/{code}` | Delete room |

#### Code Execution (`/api/execute`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/execute` | Execute code |

#### AI Assistant (`/api/ai`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/review` | Code review |
| POST | `/api/ai/bugs` | Bug detection |
| POST | `/api/ai/complexity` | Complexity analysis |
| POST | `/api/ai/hint` | Get coding hint |

#### WebSocket
```
ws://localhost:8080/ws/editor?token=<JWT>&roomCode=<ROOM_CODE>
```

## Project Structure

```
codesync-backend/src/main/java/com/codesync/
├── CodesyncBackendApplication.java
├── common/
│   ├── dto/ApiError.java
│   └── exception/
│       ├── ApiException.java
│       └── GlobalExceptionHandler.java
├── config/
│   ├── SecurityConfig.java
│   ├── WebSocketConfig.java
│   └── RedisConfig.java
└── module/
    ├── auth/           # JWT + OAuth2 authentication
    ├── user/           # User profile management
    ├── room/           # Coding rooms (create/join/leave)
    ├── editor/         # Realtime CRDT editor + WebSocket
    ├── execution/      # Sandboxed code execution
    └── ai/             # AI-powered code assistance
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID | placeholder |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret | placeholder |
| `GITHUB_CLIENT_ID` | GitHub OAuth2 client ID | placeholder |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth2 client secret | placeholder |
| `OPENAI_API_KEY` | OpenAI API key for AI features | sk-placeholder |
