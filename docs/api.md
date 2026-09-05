# PRAMAANX API Documentation

Base URL: `http://127.0.0.1:5000/api`

## Authentication

All endpoints except `/api/health` and `/api/auth/login` require a Bearer token.

```
Authorization: Bearer <access_token>
```

## Endpoints

### POST /api/auth/login

Login with Officer ID and password.

```json
{
  "officer_id": "SSB/VER/2024-0142",
  "password": "password",
  "checkpoint_code": "CHK-JALP-01",
  "role": "officer"
}
```

### POST /api/auth/logout

Logout current session.

### GET /api/auth/me

Get current officer profile.

### GET /api/checkpoints

List active checkpoints.

### POST /api/checkpoints/select

Select and validate checkpoint for current officer.

### POST /api/verifications

Create a new verification session.

```json
{
  "checkpoint_id": "uuid"
}
```

### POST /api/verifications/{id}/document

Submit document capture metadata.

### POST /api/verifications/{id}/document/analyze

Run document analysis pipeline.

### POST /api/verifications/{id}/biometric/analyze

Run biometric analysis pipeline.

### POST /api/verifications/{id}/risk

Calculate risk assessment.

### GET /api/verifications/{id}/result

Get full verification result.

### POST /api/verifications/{id}/decision

Record final decision.

```json
{
  "action": "APPROVE",
  "reason": "All checks passed"
}
```

### GET /api/history

Get verification history with filters.

### GET /api/reviews/pending

Get pending review cases (supervisor/admin).

### GET /api/audit

Get audit trail with filters.

### GET /api/audit/integrity

Verify audit hash chain integrity.

### GET /api/admin/stats

Get admin statistics (admin only).

### GET /api/system/status

Get system component health.

## Error Responses

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```
