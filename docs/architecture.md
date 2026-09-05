# PRAMAANX Architecture

## Overview

PRAMAANX is a government identity and document verification system built around a practical monorepo structure.

## Components

- **Frontend**: Electron desktop app with embedded React UI
- **API**: Python FastAPI backend for auth, session management, and database coordination
- **AI Service**: Node.js + Express service for Gemini supporting analysis
- **Local Engine**: Python-based document, biometric, and forensic processing
- **Database**: Supabase PostgreSQL with RLS

## Data Flow

1. Officer authenticates via Supabase Auth
2. Frontend creates verification session via FastAPI
3. Local engine processes document and biometric data
4. Risk engine combines signals
5. AI service provides supporting opinion (metadata only)
6. Results persisted to Supabase with audit hash chain
