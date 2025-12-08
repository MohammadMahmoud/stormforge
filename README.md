#  StormForge

[![GitHub stars](https://img.shields.io/github/stars/MohammadMahmoud/stormforge?style=social)](https://github.com/MohammadMahmoud/stormforge)
[![GitHub license](https://img.shields.io/github/license/MohammadMahmoud/stormforge)](https://github.com/MohammadMahmoud/stormforge/blob/main/LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v20-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Fastify](https://img.shields.io/badge/Fastify-v5-orange)](https://fastify.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-v6-green)](https://prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-ready-blue)](https://docker.com/)

**Production-ready REST API framework built with Fastify + TypeScript + Prisma + PostgreSQL.** Scalable, secure, fully Dockerized with automated OpenAPI docs, testing, and CI/CD ready.

##  Features

- ⚡ **Fastify** - High-performance Node.js framework (2-3x faster than Express)
- 🔤 **TypeScript** - Full type safety end-to-end
- 🗃️ **Prisma ORM** - Type-safe database client for PostgreSQL
- 🔒 **Security** - Helmet, CORS, Rate Limiting, Ajv JSON Schema Validation
- 📚 **Swagger/OpenAPI** - Auto-generated interactive API docs
- 🐳 **Docker** - Development & Production ready containers
- ✅ **Testing** - Vitest with coverage & UI reporter
- 📊 **Observability** - Structured logging (Pino), health checks
- 🎯 **Modular** - Clean architecture ready to scale to microservices

##  Tech Stack
Fastify + TypeScript + Prisma + PostgreSQL + Docker
↓
REST API → Rate Limited → Validated (Ajv) → Persisted → Documented (Swagger)


##  Quick Start

### Prerequisites
- Node.js **22+** (`nvm use 22`)
- Docker & Docker Compose
- Git

### 1. Clone & Install
```shell
npm install
```
### 2. Start PostgreSQL
```shell
docker compose up -d postgres
```
### 3. Database Setup
```shell
npx prisma db push 
npx prisma generate 
```
### 4. Development Server
```shell
npm run dev
```
**✅ Server ready at `http://localhost:3000` | 📚 Docs at `http://localhost:3000/docs`**

## 📋 API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/users` | List users |
| `POST` | `/api/users` | Create user |

**Try it live:**
Health check
curl http://localhost:3000/health

List users
curl http://localhost:3000/api/users

Create user
curl -X POST http://localhost:3000/api/users
-H "Content-Type: application/json"
-d '{"email":"test@example.com","name":"John Doe"}'

## Testing & Quality
```shell
npm test 
npm run test:coverage 
npm run test:ui 
npm run lint
npm run format
```
## Production Deployment
```shell
npm run build 
docker compose up -d 
```
OR
```shell
npm run docker:prod
```
##  Project Structure
stormforge/
├── src/
│ ├── server.ts # Entry point
│ ├── plugins/
│ │ └── prisma.ts # Prisma Fastify plugin
│ ├── modules/
│ │ └── user/ # Feature modules (scalable!)
│ │ ├── routes.ts # Routes + Handlers
│ │ └── schema.ts # Ajv validation schemas
│ ├── config/ # Configuration
│ └── utils/ # Shared utilities
├── prisma/
│ └── schema.prisma # Database models
├── docker-compose.yml # Postgres + App
├── Dockerfile # Production build
└── tests/ # Vitest tests

##  Environment Variables
Copy `.env.example` to `.env`:
DATABASE_URL="postgresql://stormforge:stormforge@localhost:5432/stormforge?schema=public"
PORT=3000
NODE_ENV=development
LOG_LEVEL=info


##  Docker Commands
```shell
npm run db:studio # Prisma Studio (GUI)
npm run db:migrate # Create migrations
npm run db:push # Push schema changes
npm run db:generate # Regenerate client
```


##  Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

##  License

[MIT License](LICENSE) - Free to use in commercial projects.

## Author

**Mohammad Mahmoud**  
[LinkedIn](https://www.linkedin.com/in/mohammed-mahmoud-0684067390/) | [GitHub](https://github.com/MohammadMahmoud)

---

 **Star this repo if you found it useful!** 
