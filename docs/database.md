# PRAMAANX Database Schema

## Tables

### officers
Application user profiles linked to Supabase Auth.

### checkpoints
Physical/digital verification locations.

### workstations
Devices assigned to checkpoints.

### officer_checkpoint_assignments
Officer-to-checkpoint mapping with active flag.

### verification_sessions
Active and completed verification workflows.

### document_captures
Captured document metadata and OCR results.

### document_analysis
Document forensic analysis results.

### biometric_analysis
Face/biometric derived scores only (no embeddings).

### verification_checks
Evidence checklist items driving the UI.

### risk_assessments
Calculated risk scores and levels.

### ai_opinions
Supporting Gemini analysis (not final decisions).

### verification_decisions
Final officer actions.

### review_actions
Supervisor review workflow actions.

### audit_logs
Append-only tamper-evident event log with SHA-256 hash chain.

### system_events
Component health monitoring.

## Indexes

Key indexes on verification_sessions, audit_logs, and foreign key columns for query performance.

## RLS

Row Level Security enforces:
- Officers see own profile and assigned checkpoint data
- Supervisors see review cases and audit records
- Admins have full access
