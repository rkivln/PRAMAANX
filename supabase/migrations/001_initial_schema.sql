-- ================================================================
-- PRAMAANX — Identity & Document Verification System
-- Database Schema v1.0
-- ================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================================
-- ENUMS
-- ================================================================

CREATE TYPE officer_role AS ENUM ('officer', 'supervisor', 'admin');
CREATE TYPE verification_status AS ENUM ('started', 'processing', 'pending_review', 'verified', 'rejected', 'cancelled');
CREATE TYPE risk_level AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE decision_type AS ENUM ('VERIFIED', 'REVIEW', 'REJECTED');
CREATE TYPE review_action_type AS ENUM ('REVIEW', 'APPROVE', 'REJECT', 'ESCALATE');

-- ================================================================
-- TABLE: officers
-- ================================================================

CREATE TABLE IF NOT EXISTS officers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    officer_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role officer_role NOT NULL DEFAULT 'officer',
    email TEXT,
    rank TEXT,
    unit TEXT,
    active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE: checkpoints
-- ================================================================

CREATE TABLE IF NOT EXISTS checkpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checkpoint_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    location TEXT,
    checkpoint_type TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE: workstations
-- ================================================================

CREATE TABLE IF NOT EXISTS workstations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workstation_code TEXT UNIQUE NOT NULL,
    checkpoint_id UUID REFERENCES checkpoints(id) ON DELETE SET NULL,
    device_name TEXT,
    status TEXT DEFAULT 'active',
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE: officer_checkpoint_assignments
-- ================================================================

CREATE TABLE IF NOT EXISTS officer_checkpoint_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    officer_id UUID REFERENCES officers(id) ON DELETE CASCADE,
    checkpoint_id UUID REFERENCES checkpoints(id) ON DELETE CASCADE,
    active BOOLEAN DEFAULT TRUE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(officer_id, checkpoint_id)
);

-- ================================================================
-- TABLE: verification_sessions
-- ================================================================

CREATE TABLE IF NOT EXISTS verification_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_id TEXT UNIQUE NOT NULL,
    officer_id UUID REFERENCES officers(id) ON DELETE SET NULL,
    checkpoint_id UUID REFERENCES checkpoints(id) ON DELETE SET NULL,
    workstation_id UUID REFERENCES workstations(id) ON DELETE SET NULL,
    status verification_status NOT NULL DEFAULT 'started',
    current_step INTEGER DEFAULT 1,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    demo_mode BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE: document_captures
-- ================================================================

CREATE TABLE IF NOT EXISTS document_captures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_session_id UUID REFERENCES verification_sessions(id) ON DELETE CASCADE,
    document_type TEXT,
    document_number_masked TEXT,
    subject_name_masked TEXT,
    date_of_birth_masked TEXT,
    issuing_authority TEXT,
    image_sha256 TEXT,
    capture_resolution TEXT,
    mime_type TEXT,
    ocr_text JSONB,
    mrz_data JSONB,
    document_metadata JSONB,
    captured_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE: document_analysis
-- ================================================================

CREATE TABLE IF NOT EXISTS document_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_session_id UUID REFERENCES verification_sessions(id) ON DELETE CASCADE,
    document_type_detected TEXT,
    ocr_confidence NUMERIC(5,2),
    pattern_validation_status TEXT,
    mrz_status TEXT,
    stamp_status TEXT,
    tamper_status TEXT,
    authenticity_score NUMERIC(5,2),
    metadata_anomalies JSONB,
    forensic_findings JSONB,
    engine_version TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE: biometric_analysis
-- ================================================================

CREATE TABLE IF NOT EXISTS biometric_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_session_id UUID REFERENCES verification_sessions(id) ON DELETE CASCADE,
    face_detected BOOLEAN,
    face_quality_score NUMERIC(5,2),
    face_similarity_score NUMERIC(5,2),
    liveness_score NUMERIC(5,2),
    liveness_status TEXT,
    face_match_status TEXT,
    model_name TEXT,
    model_version TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE: verification_checks
-- ================================================================

CREATE TABLE IF NOT EXISTS verification_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_session_id UUID REFERENCES verification_sessions(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    check_name TEXT NOT NULL,
    metric_value TEXT,
    engine TEXT,
    result TEXT,
    notes TEXT,
    severity TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE: risk_assessments
-- ================================================================

CREATE TABLE IF NOT EXISTS risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_session_id UUID REFERENCES verification_sessions(id) ON DELETE CASCADE,
    risk_score NUMERIC(5,4),
    risk_level risk_level,
    confidence NUMERIC(5,4),
    decision_recommendation TEXT,
    reasons JSONB,
    signal_summary JSONB,
    rules_version TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE: ai_opinions
-- ================================================================

CREATE TABLE IF NOT EXISTS ai_opinions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_session_id UUID REFERENCES verification_sessions(id) ON DELETE CASCADE,
    provider TEXT,
    model TEXT,
    prompt_version TEXT,
    opinion TEXT,
    confidence NUMERIC(5,4),
    structured_findings JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE: verification_decisions
-- ================================================================

CREATE TABLE IF NOT EXISTS verification_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_session_id UUID REFERENCES verification_sessions(id) ON DELETE CASCADE,
    decision decision_type NOT NULL,
    decision_source TEXT,
    officer_id UUID REFERENCES officers(id) ON DELETE SET NULL,
    reason TEXT,
    previous_decision TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE: review_actions
-- ================================================================

CREATE TABLE IF NOT EXISTS review_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_session_id UUID REFERENCES verification_sessions(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES officers(id) ON DELETE SET NULL,
    action review_action_type NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE: audit_logs
-- ================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_session_id UUID REFERENCES verification_sessions(id) ON DELETE SET NULL,
    officer_id UUID REFERENCES officers(id) ON DELETE SET NULL,
    checkpoint_id UUID REFERENCES checkpoints(id) ON DELETE SET NULL,
    workstation_id UUID REFERENCES workstations(id) ON DELETE SET NULL,
    event_code TEXT NOT NULL,
    action_description TEXT,
    result TEXT,
    metadata JSONB,
    event_timestamp TIMESTAMPTZ DEFAULT NOW(),
    previous_hash TEXT,
    event_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE: system_events
-- ================================================================

CREATE TABLE IF NOT EXISTS system_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component TEXT NOT NULL,
    status TEXT NOT NULL,
    message TEXT,
    checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- INDEXES
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_verification_sessions_verification_id ON verification_sessions(verification_id);
CREATE INDEX IF NOT EXISTS idx_verification_sessions_officer_id ON verification_sessions(officer_id);
CREATE INDEX IF NOT EXISTS idx_verification_sessions_checkpoint_id ON verification_sessions(checkpoint_id);
CREATE INDEX IF NOT EXISTS idx_verification_sessions_status ON verification_sessions(status);
CREATE INDEX IF NOT EXISTS idx_verification_sessions_started_at ON verification_sessions(started_at);

CREATE INDEX IF NOT EXISTS idx_document_captures_verification_session_id ON document_captures(verification_session_id);
CREATE INDEX IF NOT EXISTS idx_biometric_analysis_verification_session_id ON biometric_analysis(verification_session_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_verification_session_id ON risk_assessments(verification_session_id);
CREATE INDEX IF NOT EXISTS idx_verification_decisions_verification_session_id ON verification_decisions(verification_session_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_verification_session_id ON audit_logs(verification_session_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_officer_id ON audit_logs(officer_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_timestamp ON audit_logs(event_timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_code ON audit_logs(event_code);

CREATE INDEX IF NOT EXISTS idx_officers_officer_id ON officers(officer_id);
CREATE INDEX IF NOT EXISTS idx_checkpoints_checkpoint_code ON checkpoints(checkpoint_code);
