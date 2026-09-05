-- ================================================================
-- PRAMAANX — Additional Tables v1.1
-- ================================================================

-- ================================================================
-- TABLE: forensic_analysis
-- ================================================================

CREATE TABLE IF NOT EXISTS forensic_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_session_id UUID REFERENCES verification_sessions(id) ON DELETE CASCADE,
    ela_score NUMERIC(5,4),
    ela_status TEXT,
    ela_finding TEXT,
    dqt_score NUMERIC(5,4),
    dqt_status TEXT,
    dqt_finding TEXT,
    splice_score NUMERIC(5,4),
    splice_status TEXT,
    splice_finding TEXT,
    orb_match_score NUMERIC(5,4),
    orb_status TEXT,
    orb_finding TEXT,
    ssim_score NUMERIC(5,4),
    ssim_status TEXT,
    ssim_finding TEXT,
    metadata_anomaly_score NUMERIC(5,4),
    metadata_status TEXT,
    metadata_finding TEXT,
    overall_authenticity_score NUMERIC(5,4),
    engine_version TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE: cross_stream_checks
-- ================================================================

CREATE TABLE IF NOT EXISTS cross_stream_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_session_id UUID REFERENCES verification_sessions(id) ON DELETE CASCADE,
    check_id TEXT NOT NULL,
    check_name TEXT NOT NULL,
    stream_a TEXT,
    stream_b TEXT,
    comparison TEXT,
    status TEXT NOT NULL,
    severity TEXT,
    confidence NUMERIC(5,4),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE: hard_tripwires
-- ================================================================

CREATE TABLE IF NOT EXISTS hard_tripwires (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_session_id UUID REFERENCES verification_sessions(id) ON DELETE CASCADE,
    tripwire_code TEXT NOT NULL,
    severity TEXT NOT NULL,
    reason TEXT,
    requires_officer_action BOOLEAN DEFAULT TRUE,
    triggered BOOLEAN DEFAULT TRUE,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE: risk_signals
-- ================================================================

CREATE TABLE IF NOT EXISTS risk_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_session_id UUID REFERENCES verification_sessions(id) ON DELETE CASCADE,
    signal_id TEXT NOT NULL,
    signal_type TEXT NOT NULL,
    weight NUMERIC(5,4),
    value NUMERIC(5,4),
    confidence NUMERIC(5,4),
    reliability NUMERIC(5,4),
    direction TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE: sync_jobs
-- ================================================================

CREATE TABLE IF NOT EXISTS sync_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_id TEXT NOT NULL,
    payload_hash TEXT,
    status TEXT NOT NULL DEFAULT 'QUEUED',
    attempt_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_attempt_at TIMESTAMPTZ,
    synced_at TIMESTAMPTZ,
    error TEXT,
    metadata JSONB
);

-- ================================================================
-- TABLE: engine_versions
-- ================================================================

CREATE TABLE IF NOT EXISTS engine_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    engine_name TEXT NOT NULL,
    version TEXT NOT NULL,
    model_name TEXT,
    model_file TEXT,
    active BOOLEAN DEFAULT TRUE,
    deployed_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- ================================================================
-- TABLE: rules_versions
-- ================================================================

CREATE TABLE IF NOT EXISTS rules_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rules_id TEXT NOT NULL,
    version TEXT NOT NULL,
    name TEXT,
    description TEXT,
    active BOOLEAN DEFAULT FALSE,
    deployed_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

-- ================================================================
-- INDEXES for new tables
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_forensic_analysis_verification_session_id ON forensic_analysis(verification_session_id);
CREATE INDEX IF NOT EXISTS idx_cross_stream-checks_verification_session_id ON cross_stream_checks(verification_session_id);
CREATE INDEX IF NOT EXISTS idx_hard_tripwires_verification_session_id ON hard_tripwires(verification_session_id);
CREATE INDEX IF NOT EXISTS idx_risk_signals_verification_session_id ON risk_signals(verification_session_id);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_verification_id ON sync_jobs(verification_id);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_status ON sync_jobs(status);

-- Seed engine versions
INSERT INTO engine_versions (engine_name, version, model_name, active) VALUES
('OCR', 'PP-OCRv4', 'PP-OCRv4', TRUE),
('DETECTOR', 'SCRFD', 'SCRFD_2.5G', TRUE),
('FACE', 'AdaFace', 'adaface_ir18_webangular_100e', TRUE),
('LIVENESS', 'Silence-FAS', 'Silence-FAS-v1.0', TRUE),
('FORENSICS', 'PRAMAANX-Forensics-v1', 'ELA+DQT+ORB+SSIM', TRUE),
('RISK', 'PRAMAANX-RISK-1.0', 'Weighted Evidence Fusion', TRUE)
ON CONFLICT DO NOTHING;

-- Seed active rules version
INSERT INTO rules_versions (rules_id, version, name, description, active) VALUES
('RISK', 'PRAMAANX-RISK-1.0', 'PRAMAANX Risk Rules v1.0', 'Initial weighted evidence fusion rules', TRUE)
ON CONFLICT DO NOTHING;
