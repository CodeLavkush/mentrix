# 🚀 Mentrix

<div align="center">

<h3>AI-Powered Study Assistant for Students</h3>

<p>
Transform study materials into interactive learning experiences using AI.
</p>

<!-- Repository Badges -->
<p>
  <img src="https://img.shields.io/github/stars/codelavkush/mentrix?style=for-the-badge" />
  <img src="https://img.shields.io/github/forks/codelavkush/mentrix?style=for-the-badge" />
  <img src="https://img.shields.io/github/issues/codelavkush/mentrix?style=for-the-badge" />
  <img src="https://img.shields.io/github/license/codelavkush/mentrix?style=for-the-badge" />
</p>

<p>
  <img src="https://img.shields.io/github/last-commit/YOUR_USERNAME/mentrix?style=for-the-badge" />
  <img src="https://img.shields.io/github/repo-size/YOUR_USERNAME/mentrix?style=for-the-badge" />
  <img src="https://img.shields.io/github/languages/top/YOUR_USERNAME/mentrix?style=for-the-badge" />
  <img src="https://img.shields.io/github/languages/count/YOUR_USERNAME/mentrix?style=for-the-badge" />
</p>

<br>

### 🎨 Frontend

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-8B5CF6?style=for-the-badge&logo=redux&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

<br>

### ⚙️ Backend

![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-5-000000?style=for-the-badge&logo=express&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![bcrypt](https://img.shields.io/badge/bcrypt-Security-4C8BF5?style=for-the-badge)

<br>

### 🤖 AI

![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.116-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-Framework-1C3C3C?style=for-the-badge)
![Google Gemini](https://img.shields.io/badge/Google-Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Gemini Vision](https://img.shields.io/badge/Google-Gemini_Vision-4285F4?style=for-the-badge&logo=google&logoColor=white)
![RAG](https://img.shields.io/badge/RAG-Pipeline-8B5CF6?style=for-the-badge)

<br>

### 🗄️ Database

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Qdrant](https://img.shields.io/badge/Qdrant-Vector_DB-FF4F8B?style=for-the-badge&logo=qdrant&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![MinIO](https://img.shields.io/badge/MinIO-Object_Storage-C72E29?style=for-the-badge&logo=minio&logoColor=white)

<br>

### 🚀 DevOps

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Docker Compose](https://img.shields.io/badge/Docker_Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![BullMQ](https://img.shields.io/badge/BullMQ-Queue-F59E0B?style=for-the-badge)
![Mailtrap](https://img.shields.io/badge/Mailtrap-Email-22C55E?style=for-the-badge)
![Excalidraw](https://img.shields.io/badge/Excalidraw-Whiteboard-6965DB?style=for-the-badge)

<br>

![License](https://img.shields.io/badge/License-MIT-success?style=for-the-badge)

</div>

---

## 📖 About

Mentrix is a full-stack AI-powered learning platform designed to help students study smarter. It transforms static study materials into an interactive learning experience by allowing users to upload documents, chat with them using Retrieval-Augmented Generation (RAG), generate quizzes and flashcards, take notes, and organize their learning in one centralized workspace.

---

## ✨ Features

- 📄 Upload digital and scanned PDF documents
- 👁️ AI-powered OCR using Google Gemini Vision
- 💬 Chat with documents using RAG
- 🧠 AI-generated quizzes
- 📝 AI-generated flashcards
- 📒 Personal notes
- 🎨 Interactive whiteboard
- 🔍 Semantic document search
- 🔐 Secure JWT authentication
- ⚡ Asynchronous document processing using BullMQ
- 📊 Learning progress tracking

---

# 🏗️ Architecture

```text
                    React + TypeScript
                           │
                     Express Backend
                           │
       ┌───────────────────┼───────────────────┐
       │                   │                   │
 PostgreSQL            Redis Queue         MinIO Storage
    Prisma              BullMQ Jobs         Documents
       │                   │
       └───────────────────┘
                │
          FastAPI AI Service
                │
      ┌─────────┴─────────┐
      │                   │
  Google Gemini      LangChain
 Vision + Embeddings
                │
         Text Chunking
                │
        Qdrant Vector DB
```

---

# 📂 Project Structure

```text
mentrix/
│
├── app/
│   ├── frontend/
│   └── backend/
│
└── services/
    └── ai-service/
```

---

# ⚙️ Tech Stack

| Layer | Technology |
|--------|------------|
| Frontend | React, TypeScript, Redux Toolkit, React Router, Tailwind CSS |
| Backend | Node.js, Express.js |
| AI | Python, FastAPI, LangChain, Google Gemini |
| OCR | Google Gemini Vision |
| Database | PostgreSQL + Prisma ORM |
| Vector Database | Qdrant |
| Queue & Cache | Redis + BullMQ |
| Storage | MinIO |
| Authentication | JWT + bcrypt |
| Email | Mailtrap |
| Whiteboard | Excalidraw |
| Containerization | Docker & Docker Compose |

---

# 🤖 AI Processing Pipeline

```text
User Uploads Document
          │
          ▼
 Store Document in MinIO
          │
          ▼
 Create BullMQ Job
          │
          ▼
 AI Service
          │
          ▼
 Detect Document Type
          │
     ┌────┴────┐
     │         │
     ▼         ▼
Digital PDF  Scanned PDF/Image
     │         │
     ▼         ▼
 PDF Parser  Gemini Vision OCR
     └────┬────┘
          ▼
    Extracted Text
          │
          ▼
     Text Chunking
          │
          ▼
 Gemini Embeddings
          │
          ▼
 Store in Qdrant
          │
          ▼
 Ready for AI Chat
```

---

# 🚀 Getting Started

## Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/mentrix.git

cd mentrix
```

## Install Dependencies

### Frontend

```bash
cd app/frontend
pnpm install
```

### Backend

```bash
cd app/backend
pnpm install
```

### AI Service

```bash
cd services/ai-service
uv sync
```

---

## 🐳 Run with Docker

```bash
docker compose up --build
```

---

# 📌 Core Modules

- Authentication
- Dashboard
- Document Upload
- AI Chat (RAG)
- Quiz Generator
- Flashcard Generator
- Notes
- Whiteboard
- Profile Management

---

# 📸 Screenshots

> Coming Soon

---

# 🛣️ Roadmap

- [x] Authentication
- [x] Document Upload
- [x] Google Gemini Vision OCR
- [x] AI Chat (RAG)
- [ ] Quiz Generator
- [ ] Flashcards
- [ ] Notes
- [ ] Whiteboard
- [ ] AI Study Planner

---

# 🤝 Contributing

Contributions, issues, and feature requests are welcome.

Feel free to fork the repository and submit a pull request.

---

# 📄 License

This project is licensed under the MIT License.

---

<div align="center">

### ⭐ If you found this project useful, consider giving it a star!

Built with ❤️ using **React**, **Express**, **FastAPI**, **LangChain**, **Google Gemini**, and **Qdrant**.

</div>
