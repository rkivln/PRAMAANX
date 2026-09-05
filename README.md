# PRAMAANX

**Identity & Document Verification and Border Screening System**

PRAMAANX is a government-facing identity and document verification workstation. It combines local document and biometric processing with a supporting AI analysis layer and a tamper-evident audit trail.

## Architecture

```
Field Capture
    ↓
Tauri Desktop App
    ↓
FastAPI Edge Engine
    ↓
Document / Biometric / Forensic / Registry
    ↓
Cross-Stream Validator
    ↓
Risk Engine
    ↓
Officer Decision
    ↓
Audit Hash
    ↓
Local Cleanup
    ↓
Optional Controlled Sync
    ↓
Supabase
```

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Desktop | Tauri + React 19 + TypeScript + Vite + Tailwind CSS |
| Edge API | Python + FastAPI + Uvicorn |
| Edge Inference | PyTorch + ONNX Runtime + TensorRT |
| Document | PP-OCRv4 + OpenCV + ICAO 9303 parser |
| Biometric | SCRFD + AdaFace 512-D + ONNX Runtime |
| Forensics | ELA + DQT + ORB + SSIM + EXIF |
| AI Support | Node.js + Express + Gemini |
| Database | Supabase (PostgreSQL) |
| Audit | SHA-256 chained audit records |

## Key Principles

1. **Edge-first processing**: All biometric processing happens locally on the edge workstation.
2. **No raw biometric transmission**: Raw face images and embeddings are never sent to external services.
3. **Human-in-the-loop**: Final screening decisions remain under authorized officer control.
4. **Tamper-evident audit**: Every important operation creates an append-only audit event with SHA-256 hash chain.
5. **Offline operation**: The edge engine continues functioning without Internet connectivity.

## Repository Structure

```
pramaanx/
├── apps/
│   └── desktop/           # Tauri desktop application
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── hooks/
│       │   ├── services/api/
│       │   ├── store/
│       │   ├── types/
│       │   └── utils/
│       └── src-tauri/
├── edge/
│   ├── api/               # FastAPI backend
│   │   ├── app/
│   │   │   ├── api/
│   │   │   ├── services/
│   │   │   ├── schemas/
│   │   │   └── state_machine.py
│   │   └── tests/
│   └── inference/         # Local inference engines
│       ├── document/
│       ├── biometric/
│       ├── forensic/
│       ├── registry/
│       ├── liveness/
│       └── common/
├── services/
│   └── ai-service/        # Node.js Gemini supporting service
├── supabase/
│   ├── migrations/
│   └── seed/
├── packages/
│   └── contracts/         # Shared TypeScript types
├── docs/
├── scripts/
└── .github/workflows/
```

## Installation

### Prerequisites

- Node.js >= 18.0.0
- Python >= 3.10
- PostgreSQL (via Supabase)
- Tauri CLI (for desktop builds)

### Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your credentials
3. Install dependencies:

```bash
# Install root dependencies
pnpm install

# Install API dependencies
cd services/api
pip install -r requirements.txt

# Install AI service dependencies
cd services/ai-service
npm install

# Install desktop dependencies
cd apps/desktop
npm install
```

### Supabase Setup

1. Create a Supabase project
2. Apply migrations:
```bash
cd supabase
supabase db reset
```
3. Create officer accounts in Supabase Auth Dashboard
4. Insert officer profiles matching auth.user IDs

### Running the Application

```bash
# Start Edge API (FastAPI)
cd services/api
uvicorn app.main:app --reload --port 5000

# Start AI Service (Node.js)
cd services/ai-service
npm run dev

# Start Desktop App (Tauri)
cd apps/desktop
npm run tauri:dev
```

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `GEMINI_API_KEY` - Gemini API key (optional)
- `RETENTION_MODE` - `ZERO_RETENTION` or `STANDARD`
- `ENABLE_CLOUD_SYNC` - Enable/disable cloud sync
- `ENABLE_AI_OPINION` - Enable/disable AI analysis

## Security

- JWT authentication with short session expiry
- Row Level Security (RLS) at database level
- SHA-256 chained audit records
- Biometric data never leaves the edge workstation
- Zero-retention mode for temporary artifacts
- Secure local file handling with generated filenames

## Audit Integrity

Every audit event contains:
- `event_hash` - SHA-256 hash of the event
- `previous_hash` - Hash of the previous event

The chain can be verified via:
```bash
GET /api/audit/integrity
```

## Offline Operation

The workstation continues working with:
- No Internet
- No Supabase connection
- No Gemini connection

When cloud services are unavailable:
- AI opinion: `UNAVAILABLE`
- Cloud synchronization: `QUEUED`
- Local screening: `OPERATIONAL`

## Testing

```bash
# Backend tests
cd services/api
pytest tests/ -v

# AI service tests
cd services/ai-service
npm test
```

## License

MIT
