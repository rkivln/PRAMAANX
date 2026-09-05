# PRAMAANX Deployment Guide

## Prerequisites

- Docker and Docker Compose
- Supabase account
- Node.js 20+
- Python 3.11+

## Environment Variables

See `.env.example` for all required variables.

## Local Development

```bash
# Start Supabase local
supabase start

# Start API
cd services/api
pip install -r requirements.txt
uvicorn app.main:app --reload --port 5000

# Start AI service
cd services/ai-service
npm install
npm run dev

# Start desktop app
cd apps/desktop
npm install
npm run electron:dev
```

## Production

Build Docker images and deploy via docker-compose or Kubernetes.

Ensure service role keys are stored in secrets management, not environment variables.
