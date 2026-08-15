# 🚀 Mentrix

<div align="center">

<h3>AI-Powered Academic Assistant for Students</h3>

<p>
Transform study materials into interactive learning experiences using Retrieval-Augmented Generation (RAG), Gemini Vision OCR, adaptive quizzes, 3D flashcards, study notes, and concept whiteboards.
</p>

<!-- Repository Badges -->
<p>
  <img src="https://img.shields.io/github/stars/CodeLavkush/mentrix?style=for-the-badge" alt="Stars" />
  <img src="https://img.shields.io/github/forks/CodeLavkush/mentrix?style=for-the-badge" alt="Forks" />
  <img src="https://img.shields.io/github/issues/CodeLavkush/mentrix?style=for-the-badge" alt="Issues" />
  <img src="https://img.shields.io/github/license/CodeLavkush/mentrix?style=for-the-badge" alt="License" />
</p>

<p>
  <img src="https://img.shields.io/github/last-commit/CodeLavkush/mentrix?style=for-the-badge" alt="Last Commit" />
  <img src="https://img.shields.io/github/repo-size/CodeLavkush/mentrix?style=for-the-badge" alt="Repo Size" />
  <img src="https://img.shields.io/github/languages/top/CodeLavkush/mentrix?style=for-the-badge" alt="Top Language" />
</p>

<br>

### 🎨 Frontend
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-8B5CF6?style=for-the-badge&logo=redux&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-Animations-88CE02?style=for-the-badge&logo=greensock&logoColor=white)

<br>

### ⚙️ Backend & Workers
![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-5-000000?style=for-the-badge&logo=express&logoColor=white)
![BullMQ](https://img.shields.io/badge/BullMQ-Job_Queue-F59E0B?style=for-the-badge)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

<br>

### 🤖 AI & Embeddings
![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.116-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-Framework-1C3C3C?style=for-the-badge)
![Google Gemini](https://img.shields.io/badge/Google-Gemini_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Gemini Vision](https://img.shields.io/badge/Google-Vision_OCR-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Qdrant](https://img.shields.io/badge/Qdrant-Vector_Database-FF4F8B?style=for-the-badge&logo=qdrant&logoColor=white)

<br>

### 🗄️ Database & Infrastructure
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![MinIO](https://img.shields.io/badge/MinIO-S3_Storage-C72E29?style=for-the-badge&logo=minio&logoColor=white)
![Mailpit](https://img.shields.io/badge/Mailpit-Email_Testing-22C55E?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

<br>

</div>

---

## 📖 Table of Contents

- [About Mentrix](#-about)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Environment Setup](#-environment-setup)
- [Running the Project](#-running-the-project)
  - [Method 1: Run with Docker Compose (Recommended)](#method-1-docker-compose-recommended)
  - [Method 2: Run Locally (Bare-Metal Development)](#method-2-local-bare-metal-development)
- [Service URLs & Port Reference](#-service-urls--port-reference)
- [Troubleshooting & FAQs](#-troubleshooting--faqs)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 About

**Mentrix** is a full-stack, AI-native learning ecosystem designed for modern students and educators. It transforms static documents (PDFs, scanned textbooks, lecture notes, Word documents) into interactive revision hubs. 

Upload your study materials, and Mentrix extracts content via **Google Gemini Vision OCR**, generates dense semantic vector embeddings with **LangChain & Qdrant**, and enables:
1. **Interactive Document RAG Chat**: Context-aware citations and answers grounded in your notes.
2. **Adaptive MCQ Quizzes**: Instant practice questions graded in real time with comprehensive explanations.
3. **3D Study Flashcards**: Spaced-repetition card decks generated directly from quiz performance and document topics.
4. **Markdown Study Notes**: AI-summarized insights and personal note-taking.
5. **Interactive Canvas Whiteboard**: Visual mind maps, concept sketches, and diagramming.
6. **Smart Feature Gating**: Intuitive onboarding flow with responsive full-height layouts and form validations.

---

## ✨ Key Features

- 📄 **Multi-Format Document Ingestion**: Upload digital and scanned PDFs, DOCX, and TXT files (up to 16MB).
- 👁️ **Gemini Vision OCR & Chunking**: Extracts handwritten, scanned, and formatted mathematical/academic text.
- ⚡ **Asynchronous Ingestion Pipeline**: Background processing with BullMQ workers and Redis task queues.
- 💬 **Context-Grounded RAG Chat**: Fast, hallucination-resistant chat grounded in indexed document vectors.
- 🧠 **Adaptive Practice Quizzes**: Custom question counts and difficulty tiers with analytics.
- 📇 **Interactive Flashcard Studio**: 3D flip card review cycles with mastery tracking.
- 🎨 **Cloud Canvas Whiteboard**: Sketch diagrams and save thumbnails directly to MinIO.
- 🔐 **Secure Authentication**: JWT access/refresh tokens with 6-digit email OTP verification via Mailpit/SMTP.
- 🛡️ **Document Readiness Gate**: Guides new users to index materials before accessing document tools.
- 📱 **Responsive Desktop & Mobile Layouts**: Full-height responsive sidebar and theme toggling (Light/Dark).

---

## 🏗️ System Architecture

```text
                                  ┌───────────────────────────┐
                                  │    React 19 + Redux UI    │
                                  │   (Vite, Tailwind CSS 4)  │
                                  └─────────────┬─────────────┘
                                                │ REST API / Axios
                                                ▼
                                  ┌───────────────────────────┐
                                  │    Node.js / Express 5    │
                                  │      (Mentrix Backend)    │
                                  └──────┬──────────────┬─────┘
                                         │              │
                    ┌────────────────────┼──────────────┼────────────────────┐
                    │                    │              │                    │
                    ▼                    ▼              ▼                    ▼
             ┌──────────────┐     ┌─────────────┐ ┌───────────┐       ┌─────────────┐
             │  PostgreSQL  │     │ Redis Queue │ │   MinIO   │       │   Mailpit   │
             │ (Prisma ORM) │     │  (BullMQ)   │ │(S3 Bucket)│       │(SMTP / OTP) │
             └──────────────┘     └──────┬──────┘ └─────┬─────┘       └─────────────┘
                                         │              │
                                         ▼              │
                                  ┌─────────────┐       │
                                  │ Bull Worker │       │
                                  └──────┬──────┘       │
                                         │ Process Job  │
                                         ▼              ▼
                                  ┌───────────────────────────┐
                                  │    FastAPI AI Service     │
                                  │ (LangChain + Gemini SDK)  │
                                  └──────┬──────────────┬─────┘
                                         │              │
                         ┌───────────────┴────┐   ┌─────┴──────────────┐
                         │ Gemini Vision OCR  │   │   Qdrant Vector    │
                         │ & Embeddings 3072d │   │     Database       │
                         └────────────────────┘   └────────────────────┘
```

---

## ⚙️ Tech Stack

| Component | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19, TypeScript, Redux Toolkit, Tailwind CSS 4, GSAP | Client Single Page App |
| **Backend API** | Node.js 22, Express 5, Prisma ORM, JWT, express-validator | Core REST API & Business Logic |
| **Background Worker** | BullMQ, Node.js, Redis | Async document parsing & job queues |
| **AI Service** | Python 3.13, FastAPI, LangChain, Google Gemini SDK | OCR, chunking, embeddings & RAG |
| **Primary Database** | PostgreSQL 17 | Users, documents, notes, quizzes, flashcards |
| **Vector Database** | Qdrant | Dense vector search and document retrieval |
| **Object Storage** | MinIO (S3-compatible) | Raw document files, avatars, whiteboard blobs |
| **Email Service** | Mailpit (Dev) / SMTP (Prod) | Verification OTPs & alerts |
| **Orchestration** | Docker & Docker Compose | Containerized local & production deployment |

---

## 📋 Prerequisites

Before running the project, ensure you have the following installed:

1. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (with Docker Compose v2+)
2. **[Node.js 22+](https://nodejs.org/)** and **[pnpm](https://pnpm.io/)** (for local frontend/backend development)
3. **[Python 3.13+](https://www.python.org/)** and **[uv](https://github.com/astral-sh/uv)** (for local AI service development)
4. **Google Gemini API Key**: Get a free key from [Google AI Studio](https://aistudio.google.com/).

---

## 🔑 Environment Setup

Mentrix requires configuration files in three subdirectories. Sample environment templates are provided:

### 1. Backend Environment (`app/backend/.env`)

Copy `app/backend/.env.sample` to `app/backend/.env`:

```bash
# Windows PowerShell
copy app\backend\.env.sample app\backend\.env

# macOS / Linux
cp app/backend/.env.sample app/backend/.env
```

Default settings in `app/backend/.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/mentrix
NODE_ENV=development

MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET=mentrix-bucket

SMTP_HOST=mailpit
SMTP_PORT=1025
SMTP_USER=your-user
SMTP_PASS=your-password

REDIS_URL=redis://redis:6379
AI_SERVICE_URL=http://ai-service:8000

ACCESS_TOKEN_SECRET=your-super-secret-access-token-key-32chars
ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-32chars
REFRESH_TOKEN_EXPIRY=10d
```

> 💡 *Note: When running bare-metal locally (without Docker for Node), replace hostnames `postgres`, `redis`, `minio`, `mailpit`, and `ai-service` with `localhost` in `app/backend/.env`.*

---

### 2. AI Service Environment (`services/.env`)

Copy `services/.env.sample` to `services/.env`:

```bash
# Windows PowerShell
copy services\.env.sample services\.env

# macOS / Linux
cp services/.env.sample services/.env
```

Open `services/.env` and paste your Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here

GEMINI_VISION_MODEL=gemini-2.5-flash
CHAT_MODEL=gemini-2.5-flash
EMBEDDING_MODEL=gemini-embedding-001
EMBEDDING_DIMENSION=3072

QDRANT_HOST=qdrant
QDRANT_PORT=6333
QDRANT_COLLECTION=documents

MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET=mentrix-bucket
MINIO_SECURE=false

CHUNK_SIZE=1000
CHUNK_OVERLAP=200
```

---

### 3. Frontend Environment (`app/frontend/.env`)

Copy `app/frontend/.env.sample` to `app/frontend/.env`:

```bash
# Windows PowerShell
copy app\frontend\.env.sample app\frontend\.env

# macOS / Linux
cp app/frontend/.env.sample app/frontend/.env
```

Contents of `app/frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

---

## 🚀 Running the Project

### Method 1: Docker Compose (Recommended)

The easiest way to launch the entire Mentrix suite with all databases, storage, queues, AI service, backend, worker, and frontend:

```bash
# 1. Clone the repository
git clone https://github.com/CodeLavkush/mentrix.git
cd mentrix

# 2. Ensure .env files are created as described above (especially GEMINI_API_KEY in services/.env)

# 3. Build and launch all services
docker compose up --build
```

To run in the background (detached mode):
```bash
docker compose up --build -d
```

To stop all containers:
```bash
docker compose down
```

To reset all data volumes:
```bash
docker compose down -v
```

---

### Method 2: Local Bare-Metal Development

If you prefer running services directly on your host machine for faster debugging:

#### Step 1: Start Supporting Infrastructure via Docker
Run only the storage, queues, vector DB, and mail server:
```bash
docker compose up postgres redis minio qdrant mailpit -d
```

#### Step 2: Run AI Service (FastAPI)
```bash
cd services

# Using uv (recommended)
uv sync
uv run uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload

# Or standard virtualenv
python -m venv .venv
# Activate virtualenv (.venv\Scripts\activate on Windows, source .venv/bin/activate on Linux/Mac)
pip install -e .
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Step 3: Run Backend API & Background Worker
```bash
cd app/backend

# Install dependencies
pnpm install

# Push database schema to PostgreSQL
npx prisma db push

# Start Backend API (Terminal 1)
pnpm dev

# Start BullMQ Document Ingestion Worker (Terminal 2)
pnpm worker
```

#### Step 4: Run Frontend Client
```bash
cd app/frontend

# Install dependencies
pnpm install

# Start Vite dev server
pnpm dev
```

Open `http://localhost:5173` in your browser!

---

## 🌐 Service URLs & Port Reference

| Service | URL | Credentials / Notes |
|---|---|---|
| **Frontend Web App** | [http://localhost:5173](http://localhost:5173) | Mentrix Web Interface |
| **Backend REST API** | [http://localhost:4000/api/v1](http://localhost:4000/api/v1) | Express 5 Application |
| **Swagger API Docs** | [http://localhost:4000/api-docs](http://localhost:4000/api-docs) | Interactive API Documentation |
| **AI FastAPI Service** | [http://localhost:8000/docs](http://localhost:8000/docs) | OpenAPI Interactive Docs |
| **Mailpit Webmail** | [http://localhost:8025](http://localhost:8025) | View registration OTP emails |
| **MinIO Console** | [http://localhost:9001](http://localhost:9001) | User: `minioadmin` / Pass: `minioadmin123` |
| **Qdrant Vector DB** | [http://localhost:6333/dashboard](http://localhost:6333/dashboard) | Vector Collection Visualizer |
| **PostgreSQL** | `localhost:5432` | DB: `mentrix`, User: `postgres`, Pass: `postgres` |
| **Redis** | `localhost:6379` | BullMQ queue & cache |

---

## 🛠️ Verification & Quality Checks

Run linting and production build checks:

```bash
# Frontend Build Verification
npm run build --prefix app/frontend

# Backend Build Verification
npm run build --prefix app/backend

# Frontend Linter
npm run lint --prefix app/frontend
```

---

## ❓ Troubleshooting & FAQs

### 1. Where do I get the OTP code for account verification?
Mentrix uses **Mailpit** in local/Docker development. When you register an account:
1. Open [http://localhost:8025](http://localhost:8025) in your browser.
2. Click on the latest verification email sent to your address.
3. Copy the 6-digit numeric OTP and enter it on the verification page.

### 2. Document stuck on `PROCESSING` status?
- Ensure the `worker` container (or `pnpm worker`) is running and connected to Redis.
- Check that `GEMINI_API_KEY` in `services/.env` is valid and has active quota.
- Inspect worker logs: `docker compose logs -f worker` or `docker compose logs -f ai-service`.

### 3. Port Conflicts
If ports `5432`, `6379`, or `4000` are already in use by local services on your machine, stop existing services or adjust the port mappings in `docker-compose.yml`.

---

## 🤝 Contributing

Contributions are always welcome!
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

Built with ❤️ by [Lavkush](https://github.com/CodeLavkush) using **React**, **Express**, **FastAPI**, **LangChain**, **Google Gemini**, and **Qdrant**.

</div>
