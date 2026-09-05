# PRAMAANX

Identity & Document Verification System

## Overview

PRAMAANX is a government-facing identity and document verification workstation. It combines local document and biometric processing with a supporting AI analysis layer and a tamper-evident audit trail.

The system is built around a practical monorepo:

- **Frontend**: Electron desktop application with embedded HTML/JS UI
- **API**: Python FastAPI backend for authentication, session management, and database coordination
- **AI Service**: Node.js + Express service for Gemini supporting analysis (metadata only)
- **Local Engine**: Python-based document, biometric, and forensic processing
- **Database**: Supabase PostgreSQL with Row Level Security

## Architecture

```
Frontend (Electron)
    ↓
FastAPI Backend
    ↓
Local Verification Engine
    ↓
Risk Engine
    ↓
Node AI Supporting Service
    ↓
Supabase PostgreSQL
    ↓
Audit Hash Chain
```

For sensitive biometric processing, data stays local:

```
Desktop
    ↓
Local Python Engine
    ↓
Derived biometric result (scores only)
    ↓
FastAPI
    ↓
Supabase metadata only
```

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend | HTML5, JavaScript, Electron |
| Backend API | Python, FastAPI |
| AI Service | Node.js, Express, TypeScript |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth (JWT) |
| Document Processing | PaddleOCR, OpenCV |
| Biometrics | SCRFD, ArcFace, ONNX Runtime |
| Forensics | SSIM, ELA, ORB |

## Repository Structure

```
pramaanx/
├── apps/desktop/          # Electron desktop application
├── services/
│   ├── api/               # Python FastAPI backend
│   └── ai-service/        # Node.js Gemini supporting service
├── local-engine/          # Python document/biometric/forensic modules
├── supabase/
│   └── migrations/        # SQL schema, RLS, seed data
├── packages/contracts/    # Shared types/schemas
├── scripts/               # Setup and seed scripts
├── docs/                  # Architecture, security, API docs
└── .github/workflows/     # CI/CD
```

## Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in Supabase credentials and keys

```bash
cp .env.example .env
```

## Supabase Setup

1. Create a Supabase project
2. Apply migrations:

```bash
supabase db reset
```

3. Seed development data via SQL Editor or CLI

## Running the Application

### API (FastAPI)

```bash
cd services/api
pip install -r requirements.txt
uvicorn app.main:app --reload --port 5000
```

### AI Service (Node.js)

```bash
cd services/ai-service
npm install
npm run dev
```

### Desktop App (Electron)

```bash
cd apps/desktop
npm install
npm run electron:dev
```

## Testing

### Backend Tests

```bash
cd services/api
pytest tests/ -v
```

### AI Service Tests

```bash
cd services/ai-service
npm test
```

## API Documentation

- Swagger UI: http://127.0.0.1:5000/docs
- ReDoc: http://127.0.0.1:5000/redoc

## Security

- Supabase Auth for authentication
- JWT validated on every request
- Service role key never exposed to frontend
- Biometric embeddings never stored
- Raw face images never sent to external services
- Append-only audit log with SHA-256 hash chain
- Row Level Security at database level

## Data Handling

- Document images: session-only by default
- Face images: session-only, never persisted
- Biometric embeddings: never stored, never sent to external services
- AI analysis: document metadata and OCR output only
- Audit records: immutable, tamper-evident

## Demo Mode

Demo/Training mode uses seeded synthetic data and does not write to production audit logs. Demo sessions are clearly flagged in the database.

## License

MIT
