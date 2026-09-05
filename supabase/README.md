# PRAMAANX Supabase Setup

## Prerequisites
- Supabase CLI installed
- Supabase project created

## Local Development

1. Initialize Supabase local:
```bash
supabase init
```

2. Apply migrations:
```bash
supabase db reset
```

3. Start local Supabase:
```bash
supabase start
```

## Production Migrations

Apply migrations using Supabase Dashboard SQL Editor or CI/CD:
```bash
supabase db push
```

## Schema Overview

- officers: Application user profiles linked to auth.users
- checkpoints: Physical/digital verification locations
- workstations: Devices assigned to checkpoints
- officer_checkpoint_assignments: Officer-to-checkpoint mapping
- verification_sessions: Active and completed verification workflows
- document_captures: Captured document metadata and OCR results
- document_analysis: Document forensic analysis results
- biometric_analysis: Face/biometric derived scores only
- verification_checks: Evidence checklist items driving the UI
- risk_assessments: Calculated risk scores and levels
- ai_opinions: Supporting Gemini analysis (not final decisions)
- verification_decisions: Final officer actions
- review_actions: Supervisor review workflow actions
- audit_logs: Append-only tamper-evident event log
- system_events: Component health monitoring
