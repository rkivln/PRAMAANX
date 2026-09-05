# Security Documentation

## Authentication
- Supabase Auth handles all authentication
- JWT tokens validated on every request
- Service role key never exposed to frontend

## Data Handling
- Biometric embeddings never stored
- Raw face images never sent to external services
- Document images session-only by default
- All sensitive processing local

## Audit
- Append-only audit log
- SHA-256 hash chain for integrity
- No silent overwrites

## RLS
- Database-level access control
- Officers see only assigned data
- Supervisors see review cases
- Admins have full access
