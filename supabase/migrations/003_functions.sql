-- ================================================================
-- PRAMAANX — Database Functions and Triggers
-- ================================================================

-- Function: update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: officers updated_at
DROP TRIGGER IF EXISTS update_officers_updated_at ON officers;
CREATE TRIGGER update_officers_updated_at
    BEFORE UPDATE ON officers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: verification_sessions updated_at
DROP TRIGGER IF EXISTS update_verification_sessions_updated_at ON verification_sessions;
CREATE TRIGGER update_verification_sessions_updated_at
    BEFORE UPDATE ON verification_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: generate verification ID
CREATE OR REPLACE FUNCTION generate_verification_id()
RETURNS TEXT AS $$
DECLARE
    date_part TEXT;
    seq_part TEXT;
BEGIN
    date_part := TO_CHAR(NOW(), 'YYYYMMDD');
    seq_part := LPAD(CAST(FLOOR(RANDOM() * 90000 + 10000) AS TEXT), 5, '0');
    RETURN 'VR-' || date_part || '-' || seq_part;
END;
$$ LANGUAGE plpgsql;

-- Function: verify audit chain integrity
CREATE OR REPLACE FUNCTION verify_audit_chain()
RETURNS TABLE (
    id UUID,
    event_code TEXT,
    event_timestamp TIMESTAMPTZ,
    event_hash TEXT,
    previous_hash TEXT,
    chain_valid BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.event_code,
        a.event_timestamp,
        a.event_hash,
        a.previous_hash,
        CASE
            WHEN a.previous_hash IS NULL THEN TRUE
            WHEN a.previous_hash = LAG(a.event_hash) OVER (ORDER BY a.event_timestamp, a.id) THEN TRUE
            ELSE FALSE
        END AS chain_valid
    FROM audit_logs a
    ORDER BY a.event_timestamp ASC, a.id ASC;
END;
$$ LANGUAGE plpgsql;

-- Function: get dashboard stats
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_officer_id UUID, p_checkpoint_id UUID DEFAULT NULL)
RETURNS TABLE (
    today_total BIGINT,
    verified BIGINT,
    pending_review BIGINT,
    rejected BIGINT,
    success_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT,
        COUNT(CASE WHEN status = 'verified' THEN 1 END)::BIGINT,
        COUNT(CASE WHEN status = 'pending_review' THEN 1 END)::BIGINT,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END)::BIGINT,
        ROUND(COUNT(CASE WHEN status = 'verified' THEN 1 END)::NUMERIC / NULLIF(COUNT(*)::NUMERIC, 0) * 100, 2)
    FROM verification_sessions
    WHERE officer_id = p_officer_id
      AND DATE(started_at) = CURRENT_DATE
      AND (p_checkpoint_id IS NULL OR checkpoint_id = p_checkpoint_id);
END;
$$ LANGUAGE plpgsql;

-- Function: get admin stats
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS TABLE (
    total_verifications BIGINT,
    verified BIGINT,
    pending_review BIGINT,
    rejected BIGINT,
    active_officers BIGINT,
    active_checkpoints BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT,
        COUNT(CASE WHEN status = 'verified' THEN 1 END)::BIGINT,
        COUNT(CASE WHEN status = 'pending_review' THEN 1 END)::BIGINT,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END)::BIGINT,
        (SELECT COUNT(*) FROM officers WHERE active = TRUE)::BIGINT,
        (SELECT COUNT(*) FROM checkpoints WHERE status = 'active')::BIGINT
    FROM verification_sessions;
END;
$$ LANGUAGE plpgsql;
