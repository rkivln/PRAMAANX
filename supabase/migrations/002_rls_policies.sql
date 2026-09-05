-- ================================================================
-- PRAMAANX — Row Level Security Policies
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE workstations ENABLE ROW LEVEL SECURITY;
ALTER TABLE officer_checkpoint_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_captures ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE biometric_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_opinions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_events ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- OFFICERS
-- ================================================================

CREATE POLICY "Officers can view own profile" ON officers
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Officers can update own profile" ON officers
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all officers" ON officers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM officers o
            WHERE o.id = auth.uid() AND o.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage officers" ON officers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM officers o
            WHERE o.id = auth.uid() AND o.role = 'admin'
        )
    );

-- ================================================================
-- CHECKPOINTS
-- ================================================================

CREATE POLICY "Authenticated users can view checkpoints" ON checkpoints
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage checkpoints" ON checkpoints
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM officers o
            WHERE o.id = auth.uid() AND o.role = 'admin'
        )
    );

-- ================================================================
-- WORKSTATIONS
-- ================================================================

CREATE POLICY "Authenticated users can view workstations" ON workstations
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage workstations" ON workstations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM officers o
            WHERE o.id = auth.uid() AND o.role = 'admin'
        )
    );

-- ================================================================
-- OFFICER_CHECKPOINT_ASSIGNMENTS
-- ================================================================

CREATE POLICY "Officers can view own assignments" ON officer_checkpoint_assignments
    FOR SELECT USING (
        officer_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM officers o
            WHERE o.id = auth.uid() AND o.role IN ('admin', 'supervisor')
        )
    );

CREATE POLICY "Admins can manage assignments" ON officer_checkpoint_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM officers o
            WHERE o.id = auth.uid() AND o.role = 'admin'
        )
    );

-- ================================================================
-- VERIFICATION_SESSIONS
-- ================================================================

CREATE POLICY "Officers can view own verifications" ON verification_sessions
    FOR SELECT USING (
        officer_id = auth.uid() OR
        checkpoint_id IN (
            SELECT checkpoint_id FROM officer_checkpoint_assignments
            WHERE officer_id = auth.uid() AND active = TRUE
        ) OR
        EXISTS (
            SELECT 1 FROM officers o
            WHERE o.id = auth.uid() AND o.role IN ('admin', 'supervisor')
        )
    );

CREATE POLICY "Officers can create verifications" ON verification_sessions
    FOR INSERT WITH CHECK (
        officer_id = auth.uid() AND
        checkpoint_id IN (
            SELECT checkpoint_id FROM officer_checkpoint_assignments
            WHERE officer_id = auth.uid() AND active = TRUE
        )
    );

CREATE POLICY "Officers can update own verifications" ON verification_sessions
    FOR UPDATE USING (
        officer_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM officers o
            WHERE o.id = auth.uid() AND o.role IN ('admin', 'supervisor')
        )
    );

-- ================================================================
-- DOCUMENT_CAPTURES
-- ================================================================

CREATE POLICY "Officers can view document captures for accessible verifications" ON document_captures
    FOR SELECT USING (
        verification_session_id IN (
            SELECT id FROM verification_sessions
            WHERE officer_id = auth.uid()
               OR checkpoint_id IN (
                   SELECT checkpoint_id FROM officer_checkpoint_assignments
                   WHERE officer_id = auth.uid() AND active = TRUE
               )
               OR EXISTS (
                   SELECT 1 FROM officers o
                   WHERE o.id = auth.uid() AND o.role IN ('admin', 'supervisor')
               )
        )
    );

CREATE POLICY "Officers can insert document captures" ON document_captures
    FOR INSERT WITH CHECK (
        verification_session_id IN (
            SELECT id FROM verification_sessions
            WHERE officer_id = auth.uid()
        )
    );

-- ================================================================
-- DOCUMENT_ANALYSIS
-- ================================================================

CREATE POLICY "Officers can view document analysis for accessible verifications" ON document_analysis
    FOR SELECT USING (
        verification_session_id IN (
            SELECT id FROM verification_sessions
            WHERE officer_id = auth.uid()
               OR checkpoint_id IN (
                   SELECT checkpoint_id FROM officer_checkpoint_assignments
                   WHERE officer_id = auth.uid() AND active = TRUE
               )
               OR EXISTS (
                   SELECT 1 FROM officers o
                   WHERE o.id = auth.uid() AND o.role IN ('admin', 'supervisor')
               )
        )
    );

CREATE POLICY "System can insert document analysis" ON document_analysis
    FOR INSERT WITH CHECK (TRUE);

-- ================================================================
-- BIOMETRIC_ANALYSIS
-- ================================================================

CREATE POLICY "Officers can view biometric analysis for accessible verifications" ON biometric_analysis
    FOR SELECT USING (
        verification_session_id IN (
            SELECT id FROM verification_sessions
            WHERE officer_id = auth.uid()
               OR checkpoint_id IN (
                   SELECT checkpoint_id FROM officer_checkpoint_assignments
                   WHERE officer_id = auth.uid() AND active = TRUE
               )
               OR EXISTS (
                   SELECT 1 FROM officers o
                   WHERE o.id = auth.uid() AND o.role IN ('admin', 'supervisor')
               )
        )
    );

CREATE POLICY "System can insert biometric analysis" ON biometric_analysis
    FOR INSERT WITH CHECK (TRUE);

-- ================================================================
-- VERIFICATION_CHECKS
-- ================================================================

CREATE POLICY "Officers can view verification checks for accessible verifications" ON verification_checks
    FOR SELECT USING (
        verification_session_id IN (
            SELECT id FROM verification_sessions
            WHERE officer_id = auth.uid()
               OR checkpoint_id IN (
                   SELECT checkpoint_id FROM officer_checkpoint_assignments
                   WHERE officer_id = auth.uid() AND active = TRUE
               )
               OR EXISTS (
                   SELECT 1 FROM officers o
                   WHERE o.id = auth.uid() AND o.role IN ('admin', 'supervisor')
               )
        )
    );

CREATE POLICY "System can insert verification checks" ON verification_checks
    FOR INSERT WITH CHECK (TRUE);

-- ================================================================
-- RISK_ASSESSMENTS
-- ================================================================

CREATE POLICY "Officers can view risk assessments for accessible verifications" ON risk_assessments
    FOR SELECT USING (
        verification_session_id IN (
            SELECT id FROM verification_sessions
            WHERE officer_id = auth.uid()
               OR checkpoint_id IN (
                   SELECT checkpoint_id FROM officer_checkpoint_assignments
                   WHERE officer_id = auth.uid() AND active = TRUE
               )
               OR EXISTS (
                   SELECT 1 FROM officers o
                   WHERE o.id = auth.uid() AND o.role IN ('admin', 'supervisor')
               )
        )
    );

CREATE POLICY "System can insert risk assessments" ON risk_assessments
    FOR INSERT WITH CHECK (TRUE);

-- ================================================================
-- AI_OPINIONS
-- ================================================================

CREATE POLICY "Officers can view AI opinions for accessible verifications" ON ai_opinions
    FOR SELECT USING (
        verification_session_id IN (
            SELECT id FROM verification_sessions
            WHERE officer_id = auth.uid()
               OR checkpoint_id IN (
                   SELECT checkpoint_id FROM officer_checkpoint_assignments
                   WHERE officer_id = auth.uid() AND active = TRUE
               )
               OR EXISTS (
                   SELECT 1 FROM officers o
                   WHERE o.id = auth.uid() AND o.role IN ('admin', 'supervisor')
               )
        )
    );

CREATE POLICY "System can insert AI opinions" ON ai_opinions
    FOR INSERT WITH CHECK (TRUE);

-- ================================================================
-- VERIFICATION_DECISIONS
-- ================================================================

CREATE POLICY "Officers can view decisions for accessible verifications" ON verification_decisions
    FOR SELECT USING (
        verification_session_id IN (
            SELECT id FROM verification_sessions
            WHERE officer_id = auth.uid()
               OR checkpoint_id IN (
                   SELECT checkpoint_id FROM officer_checkpoint_assignments
                   WHERE officer_id = auth.uid() AND active = TRUE
               )
               OR EXISTS (
                   SELECT 1 FROM officers o
                   WHERE o.id = auth.uid() AND o.role IN ('admin', 'supervisor')
               )
        )
    );

CREATE POLICY "Officers can insert decisions for own verifications" ON verification_decisions
    FOR INSERT WITH CHECK (
        officer_id = auth.uid() AND
        verification_session_id IN (
            SELECT id FROM verification_sessions
            WHERE officer_id = auth.uid()
        )
    );

-- ================================================================
-- REVIEW_ACTIONS
-- ================================================================

CREATE POLICY "Officers can view review actions for accessible verifications" ON review_actions
    FOR SELECT USING (
        verification_session_id IN (
            SELECT id FROM verification_sessions
            WHERE officer_id = auth.uid()
               OR checkpoint_id IN (
                   SELECT checkpoint_id FROM officer_checkpoint_assignments
                   WHERE officer_id = auth.uid() AND active = TRUE
               )
               OR EXISTS (
                   SELECT 1 FROM officers o
                   WHERE o.id = auth.uid() AND o.role IN ('admin', 'supervisor')
               )
        )
    );

CREATE POLICY "Supervisors and admins can insert review actions" ON review_actions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM officers o
            WHERE o.id = auth.uid() AND o.role IN ('admin', 'supervisor')
        )
    );

-- ================================================================
-- AUDIT_LOGS
-- ================================================================

CREATE POLICY "Officers can view own audit logs" ON audit_logs
    FOR SELECT USING (
        officer_id = auth.uid() OR
        verification_session_id IN (
            SELECT id FROM verification_sessions
            WHERE officer_id = auth.uid()
               OR checkpoint_id IN (
                   SELECT checkpoint_id FROM officer_checkpoint_assignments
                   WHERE officer_id = auth.uid() AND active = TRUE
               )
               OR EXISTS (
                   SELECT 1 FROM officers o
                   WHERE o.id = auth.uid() AND o.role IN ('admin', 'supervisor')
               )
        ) OR
        EXISTS (
            SELECT 1 FROM officers o
            WHERE o.id = auth.uid() AND o.role IN ('admin', 'supervisor')
        )
    );

CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (TRUE);

-- Audit logs are immutable — no UPDATE or DELETE policies

-- ================================================================
-- SYSTEM_EVENTS
-- ================================================================

CREATE POLICY "Authenticated users can view system events" ON system_events
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert system events" ON system_events
    FOR INSERT WITH CHECK (TRUE);
