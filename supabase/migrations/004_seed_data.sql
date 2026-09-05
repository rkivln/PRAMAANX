-- ================================================================
-- PRAMAANX — Development Seed Data
-- ================================================================
-- WARNING: DEVELOPMENT DATA ONLY
-- Never use these credentials in production
-- ================================================================

-- Insert checkpoints
INSERT INTO checkpoints (checkpoint_code, name, location, checkpoint_type, status) VALUES
('CHK-JALP-01', 'Border Entry Checkpoint', 'Jalpesh, West Bengal', 'Border Entry', 'active'),
('CHK-SILG-02', 'Immigration Verification Desk', 'Siliguri, West Bengal', 'Immigration', 'active'),
('CHK-DOC-03', 'Document Screening Counter', 'Darjeeling, West Bengal', 'Document', 'active'),
('CHK-SEC-04', 'Secondary Verification', 'Secondary Unit', 'Secondary', 'active'),
('CHK-TRAIN', 'Training / Demonstration', 'Training Centre', 'Training', 'active')
ON CONFLICT (checkpoint_code) DO NOTHING;

-- Insert workstations
INSERT INTO workstations (workstation_code, checkpoint_id, device_name, status) VALUES
('WS-CHK-01', (SELECT id FROM checkpoints WHERE checkpoint_code = 'CHK-JALP-01'), 'WS-CHK-01 Device', 'active'),
('WS-CHK-02', (SELECT id FROM checkpoints WHERE checkpoint_code = 'CHK-SILG-02'), 'WS-CHK-02 Device', 'active')
ON CONFLICT (workstation_code) DO NOTHING;

-- Insert officers (passwords handled by Supabase Auth, not stored here)
-- These officer records must be created AFTER corresponding auth.users entries exist
-- Seed officer profiles for development

-- Helper: create auth user if not exists, then officer profile
DO $$
DECLARE
    v_officer_id_142 UUID;
    v_officer_id_md UUID;
    v_officer_id_ab UUID;
    v_officer_id_admin UUID;
BEGIN
    -- Rajesh Sharma (officer)
    INSERT INTO auth.users (id, email, email_confirmed_at, confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
        uuid_generate_v4(),
        'rajesh.sharma@pramaanx.gov.in',
        NOW(), NOW(), NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"RAJESH SHARMA"}',
        NOW(), NOW()
    )
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO v_officer_id_142;

    IF v_officer_id_142 IS NULL THEN
        SELECT id INTO v_officer_id_142 FROM auth.users WHERE email = 'rajesh.sharma@pramaanx.gov.in';
    END IF;

    INSERT INTO officers (id, officer_id, full_name, role, email, rank, unit, active)
    VALUES (v_officer_id_142, 'SSB/VER/2024-0142', 'RAJESH SHARMA', 'officer', 'rajesh.sharma@pramaanx.gov.in', 'Constable', 'SSB Sector 5', TRUE)
    ON CONFLICT (officer_id) DO NOTHING;

    -- M. Dewan (supervisor)
    INSERT INTO auth.users (id, email, email_confirmed_at, confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
        uuid_generate_v4(),
        'm.dewan@pramaanx.gov.in',
        NOW(), NOW(), NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"M. DEWAN"}',
        NOW(), NOW()
    )
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO v_officer_id_md;

    IF v_officer_id_md IS NULL THEN
        SELECT id INTO v_officer_id_md FROM auth.users WHERE email = 'm.dewan@pramaanx.gov.in';
    END IF;

    INSERT INTO officers (id, officer_id, full_name, role, email, rank, unit, active)
    VALUES (v_officer_id_md, 'SSB/SUP/2024-0031', 'M. DEWAN', 'supervisor', 'm.dewan@pramaanx.gov.in', 'Head Constable', 'SSB Sector 5', TRUE)
    ON CONFLICT (officer_id) DO NOTHING;

    -- A. Bose (officer)
    INSERT INTO auth.users (id, email, email_confirmed_at, confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
        uuid_generate_v4(),
        'a.bose@pramaanx.gov.in',
        NOW(), NOW(), NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"A. BOSE"}',
        NOW(), NOW()
    )
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO v_officer_id_ab;

    IF v_officer_id_ab IS NULL THEN
        SELECT id INTO v_officer_id_ab FROM auth.users WHERE email = 'a.bose@pramaanx.gov.in';
    END IF;

    INSERT INTO officers (id, officer_id, full_name, role, email, rank, unit, active)
    VALUES (v_officer_id_ab, 'SSB/VER/2024-0089', 'A. BOSE', 'officer', 'a.bose@pramaanx.gov.in', 'Constable', 'SSB Sector 12', TRUE)
    ON CONFLICT (officer_id) DO NOTHING;

    -- Admin account
    INSERT INTO auth.users (id, email, email_confirmed_at, confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
        uuid_generate_v4(),
        'admin@pramaanx.gov.in',
        NOW(), NOW(), NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"SYSTEM ADMIN"}',
        NOW(), NOW()
    )
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO v_officer_id_admin;

    IF v_officer_id_admin IS NULL THEN
        SELECT id INTO v_officer_id_admin FROM auth.users WHERE email = 'admin@pramaanx.gov.in';
    END IF;

    INSERT INTO officers (id, officer_id, full_name, role, email, rank, unit, active)
    VALUES (v_officer_id_admin, 'SSB/ADMIN/001', 'SYSTEM ADMIN', 'admin', 'admin@pramaanx.gov.in', 'Commandant', 'HQ', TRUE)
    ON CONFLICT (officer_id) DO NOTHING;
END $$;

-- Insert checkpoint assignments
DO $$
DECLARE
    v_rajesh_id UUID;
    v_m_dewan_id UUID;
    v_a_bose_id UUID;
BEGIN
    SELECT id INTO v_rajesh_id FROM officers WHERE officer_id = 'SSB/VER/2024-0142';
    SELECT id INTO v_m_dewan_id FROM officers WHERE officer_id = 'SSB/SUP/2024-0031';
    SELECT id INTO v_a_bose_id FROM officers WHERE officer_id = 'SSB/VER/2024-0089';

    INSERT INTO officer_checkpoint_assignments (officer_id, checkpoint_id, active) VALUES
    (v_rajesh_id, (SELECT id FROM checkpoints WHERE checkpoint_code = 'CHK-JALP-01'), TRUE),
    (v_rajesh_id, (SELECT id FROM checkpoints WHERE checkpoint_code = 'CHK-TRAIN'), TRUE),
    (v_m_dewan_id, (SELECT id FROM checkpoints WHERE checkpoint_code = 'CHK-SILG-02'), TRUE),
    (v_m_dewan_id, (SELECT id FROM checkpoints WHERE checkpoint_code = 'CHK-SEC-04'), TRUE),
    (v_a_bose_id, (SELECT id FROM checkpoints WHERE checkpoint_code = 'CHK-DOC-03'), TRUE)
    ON CONFLICT (officer_id, checkpoint_id) DO NOTHING;
END $$;

-- Insert historical verification sessions for realistic dashboard
DO $$
DECLARE
    v_rajesh_id UUID;
    v_m_dewan_id UUID;
    v_a_bose_id UUID;
    v_chk_jalp UUID;
    v_chk_silg UUID;
    v_chk_doc UUID;
    v_chk_sec UUID;
    v_chk_train UUID;
    v_ws_chk_01 UUID;
    v_ws_chk_02 UUID;
    v_session_id UUID;
    v_verification_id TEXT;
    i INTEGER;
BEGIN
    SELECT id INTO v_rajesh_id FROM officers WHERE officer_id = 'SSB/VER/2024-0142';
    SELECT id INTO v_m_dewan_id FROM officers WHERE officer_id = 'SSB/SUP/2024-0031';
    SELECT id INTO v_a_bose_id FROM officers WHERE officer_id = 'SSB/VER/2024-0089';
    SELECT id INTO v_chk_jalp FROM checkpoints WHERE checkpoint_code = 'CHK-JALP-01';
    SELECT id INTO v_chk_silg FROM checkpoints WHERE checkpoint_code = 'CHK-SILG-02';
    SELECT id INTO v_chk_doc FROM checkpoints WHERE checkpoint_code = 'CHK-DOC-03';
    SELECT id INTO v_chk_sec FROM checkpoints WHERE checkpoint_code = 'CHK-SEC-04';
    SELECT id INTO v_chk_train FROM checkpoints WHERE checkpoint_code = 'CHK-TRAIN';
    SELECT id INTO v_ws_chk_01 FROM workstations WHERE workstation_code = 'WS-CHK-01';
    SELECT id INTO v_ws_chk_02 FROM workstations WHERE workstation_code = 'WS-CHK-02';

    -- Generate 20+ historical records
    FOR i IN 1..25 LOOP
        v_verification_id := 'VR-' || TO_CHAR(NOW() - (i || ' day')::INTERVAL, 'YYYYMMDD') || '-' || LPAD(CAST(FLOOR(RANDOM() * 90000 + 10000) AS TEXT), 5, '0');

        INSERT INTO verification_sessions (
            verification_id, officer_id, checkpoint_id, workstation_id, status, current_step, demo_mode, started_at
        ) VALUES (
            v_verification_id,
            CASE WHEN i % 3 = 0 THEN v_m_dewan_id WHEN i % 5 = 0 THEN v_a_bose_id ELSE v_rajesh_id END,
            CASE WHEN i % 5 = 0 THEN v_chk_silg WHEN i % 3 = 0 THEN v_chk_doc WHEN i % 7 = 0 THEN v_chk_sec ELSE v_chk_jalp END,
            CASE WHEN i % 2 = 0 THEN v_ws_chk_02 ELSE v_ws_chk_01 END,
            CASE
                WHEN i % 7 = 0 THEN 'pending_review'
                WHEN i % 13 = 0 THEN 'rejected'
                ELSE 'verified'
            END,
            5,
            CASE WHEN i % 9 = 0 THEN TRUE ELSE FALSE END,
            NOW() - (i || ' day')::INTERVAL - ((i * 37) || ' minute')::INTERVAL
        )
        ON CONFLICT (verification_id) DO NOTHING
        RETURNING id INTO v_session_id;

        IF v_session_id IS NOT NULL THEN
            -- Insert document capture
            INSERT INTO document_captures (
                verification_session_id, document_type, document_number_masked, subject_name_masked,
                date_of_birth_masked, issuing_authority, image_sha256, capture_resolution, mime_type, captured_at
            ) VALUES (
                v_session_id,
                CASE WHEN i % 4 = 0 THEN 'Passport' WHEN i % 3 = 0 THEN 'Voter ID' ELSE 'Aadhaar Card' END,
                CASE WHEN i % 4 = 0 THEN 'P********21' WHEN i % 3 = 0 THEN 'VOT******1234' ELSE 'XXXX XXXX ' || (1000 + i) END,
                'R*** S***',
                '14 / 08 / 1989',
                'UIDAI / Government of India',
                encode(digest(v_verification_id || 'seed', 'sha256'), 'hex'),
                '1280x720',
                'image/jpeg',
                NOW() - (i || ' day')::INTERVAL
            );

            -- Insert document analysis
            INSERT INTO document_analysis (
                verification_session_id, document_type_detected, ocr_confidence,
                pattern_validation_status, mrz_status, stamp_status, tamper_status,
                authenticity_score, engine_version, processed_at
            ) VALUES (
                v_session_id,
                CASE WHEN i % 4 = 0 THEN 'Passport' WHEN i % 3 = 0 THEN 'Voter ID' ELSE 'Aadhaar Card' END,
                ROUND(85 + RANDOM() * 14, 2),
                'PASS',
                CASE WHEN i % 4 = 0 THEN 'PASS' ELSE 'N/A' END,
                'PASS',
                CASE WHEN i % 13 = 0 THEN 'FLAGGED' ELSE 'CLEAN' END,
                ROUND(75 + RANDOM() * 24, 2),
                'local-engine-v1.0.0',
                NOW() - (i || ' day')::INTERVAL
            );

            -- Insert biometric analysis
            INSERT INTO biometric_analysis (
                verification_session_id, face_detected, face_quality_score, face_similarity_score,
                liveness_score, liveness_status, face_match_status, model_name, model_version, processed_at
            ) VALUES (
                v_session_id,
                TRUE,
                ROUND(80 + RANDOM() * 20, 2),
                ROUND(70 + RANDOM() * 29, 2),
                ROUND(0.85 + RANDOM() * 0.14, 2),
                'PASS',
                CASE
                    WHEN i % 7 = 0 THEN 'REVIEW'
                    WHEN i % 13 = 0 THEN 'MISMATCH'
                    ELSE 'MATCH'
                END,
                'SCRFD + ArcFace',
                'v1.0.0',
                NOW() - (i || ' day')::INTERVAL
            );

            -- Insert verification checks
            INSERT INTO verification_checks (verification_session_id, category, check_name, metric_value, engine, result, severity) VALUES
            (v_session_id, 'Document', 'OCR Extraction', ROUND(85 + RANDOM() * 14, 2) || '%', 'Tesseract 5.3', 'PASS', 'info'),
            (v_session_id, 'Document', 'Pattern Validation', 'Confirmed', 'Indian Doc Rules', 'PASS', 'info'),
            (v_session_id, 'Document', 'MRZ Analysis', CASE WHEN i % 4 = 0 THEN 'PASS' ELSE 'N/A' END, 'MRZ Parser', CASE WHEN i % 4 = 0 THEN 'PASS' ELSE 'SKIPPED' END, 'info'),
            (v_session_id, 'Document', 'Stamp & Seal', 'Verified', 'Template Matcher', 'PASS', 'info'),
            (v_session_id, 'Document', 'Tamper Analysis', CASE WHEN i % 13 = 0 THEN 'Indicators found' ELSE 'No anomalies' END, 'Forensic Engine', CASE WHEN i % 13 = 0 THEN 'FLAGGED' ELSE 'CLEAN' END, 'warning'),
            (v_session_id, 'Biometric', 'Face Localisation', 'Detected', 'SCRFD', 'PASS', 'info'),
            (v_session_id, 'Biometric', 'Face Similarity', ROUND(70 + RANDOM() * 29, 2) || '%', 'ArcFace', 'PASS', 'info'),
            (v_session_id, 'Biometric', 'Liveness Check', 'PASS', 'Liveness Engine', 'PASS', 'info'),
            (v_session_id, 'Biometric', 'Quality Rating', 'GOOD', 'Quality Engine', 'PASS', 'info'),
            (v_session_id, 'AI Analysis', 'Forensic Observations', 'Authentic document', 'Gemini Supporting', 'PASS', 'info');

            -- Insert risk assessment
            INSERT INTO risk_assessments (
                verification_session_id, risk_score, risk_level, confidence,
                decision_recommendation, reasons, signal_summary, rules_version
            ) VALUES (
                v_session_id,
                ROUND(RANDOM() * 0.8, 4),
                CASE
                    WHEN i % 7 = 0 THEN 'MEDIUM'
                    WHEN i % 13 = 0 THEN 'HIGH'
                    ELSE 'LOW'
                END,
                ROUND(0.7 + RANDOM() * 0.29, 4),
                CASE
                    WHEN i % 7 = 0 THEN 'REVIEW'
                    WHEN i % 13 = 0 THEN 'REJECTED'
                    ELSE 'VERIFIED'
                END,
                CASE
                    WHEN i % 7 = 0 THEN '["Borderline face similarity", "Forensic anomaly requires officer review"]'::jsonb
                    WHEN i % 13 = 0 THEN '["Strong face mismatch", "Critical tamper detection"]'::jsonb
                    ELSE '[]'::jsonb
                END,
                '{"document_ok": true, "biometric_ok": true, "liveness_ok": true}'::jsonb,
                'rules-v1.0.0'
            );

            -- Insert verification decision for completed sessions
            IF i % 7 != 0 AND i % 13 != 0 THEN
                INSERT INTO verification_decisions (
                    verification_session_id, decision, decision_source, officer_id, reason
                ) VALUES (
                    v_session_id,
                    'VERIFIED',
                    'officer',
                    CASE WHEN i % 3 = 0 THEN v_m_dewan_id WHEN i % 5 = 0 THEN v_a_bose_id ELSE v_rajesh_id END,
                    'Document and biometric verification passed'
                );
            ELSIF i % 7 = 0 THEN
                INSERT INTO verification_decisions (
                    verification_session_id, decision, decision_source, officer_id, reason
                ) VALUES (
                    v_session_id,
                    'REVIEW',
                    'officer',
                    CASE WHEN i % 3 = 0 THEN v_m_dewan_id WHEN i % 5 = 0 THEN v_a_bose_id ELSE v_rajesh_id END,
                    'Sent for secondary review'
                );
            ELSE
                INSERT INTO verification_decisions (
                    verification_session_id, decision, decision_source, officer_id, reason
                ) VALUES (
                    v_session_id,
                    'REJECTED',
                    'officer',
                    CASE WHEN i % 3 = 0 THEN v_m_dewan_id WHEN i % 5 = 0 THEN v_a_bose_id ELSE v_rajesh_id END,
                    'Document or biometric verification failed'
                );
            END IF;

            -- Insert audit logs
            INSERT INTO audit_logs (
                verification_session_id, officer_id, checkpoint_id, workstation_id,
                event_code, action_description, result, event_timestamp
            ) VALUES
            (v_session_id, CASE WHEN i % 3 = 0 THEN v_m_dewan_id WHEN i % 5 = 0 THEN v_a_bose_id ELSE v_rajesh_id END,
             CASE WHEN i % 5 = 0 THEN v_chk_silg WHEN i % 3 = 0 THEN v_chk_doc WHEN i % 7 = 0 THEN v_chk_sec ELSE v_chk_jalp END,
             CASE WHEN i % 2 = 0 THEN v_ws_chk_02 ELSE v_ws_chk_01 END,
             'VERIFICATION_STARTED', 'Session created', 'Success', NOW() - (i || ' day')::INTERVAL - ((i * 37 + 5) || ' minute')::INTERVAL),
            (v_session_id, CASE WHEN i % 3 = 0 THEN v_m_dewan_id WHEN i % 5 = 0 THEN v_a_bose_id ELSE v_rajesh_id END,
             CASE WHEN i % 5 = 0 THEN v_chk_silg WHEN i % 3 = 0 THEN v_chk_doc WHEN i % 7 = 0 THEN v_chk_sec ELSE v_chk_jalp END,
             CASE WHEN i % 2 = 0 THEN v_ws_chk_02 ELSE v_ws_chk_01 END,
             'DOC_CAPTURE', 'Document captured', 'Success', NOW() - (i || ' day')::INTERVAL - ((i * 37 + 10) || ' minute')::INTERVAL),
            (v_session_id, CASE WHEN i % 3 = 0 THEN v_m_dewan_id WHEN i % 5 = 0 THEN v_a_bose_id ELSE v_rajesh_id END,
             CASE WHEN i % 5 = 0 THEN v_chk_silg WHEN i % 3 = 0 THEN v_chk_doc WHEN i % 7 = 0 THEN v_chk_sec ELSE v_chk_jalp END,
             CASE WHEN i % 2 = 0 THEN v_ws_chk_02 ELSE v_ws_chk_01 END,
             'DOC_ANALYSIS_COMPLETED', 'Document analysis completed', 'Success', NOW() - (i || ' day')::INTERVAL - ((i * 37 + 15) || ' minute')::INTERVAL),
            (v_session_id, CASE WHEN i % 3 = 0 THEN v_m_dewan_id WHEN i % 5 = 0 THEN v_a_bose_id ELSE v_rajesh_id END,
             CASE WHEN i % 5 = 0 THEN v_chk_silg WHEN i % 3 = 0 THEN v_chk_doc WHEN i % 7 = 0 THEN v_chk_sec ELSE v_chk_jalp END,
             CASE WHEN i % 2 = 0 THEN v_ws_chk_02 ELSE v_ws_chk_01 END,
             'BIOMETRIC_ANALYSIS_COMPLETED', 'Biometric analysis completed', 'Success', NOW() - (i || ' day')::INTERVAL - ((i * 37 + 20) || ' minute')::INTERVAL),
            (v_session_id, CASE WHEN i % 3 = 0 THEN v_m_dewan_id WHEN i % 5 = 0 THEN v_a_bose_id ELSE v_rajesh_id END,
             CASE WHEN i % 5 = 0 THEN v_chk_silg WHEN i % 3 = 0 THEN v_chk_doc WHEN i % 7 = 0 THEN v_chk_sec ELSE v_chk_jalp END,
             CASE WHEN i % 2 = 0 THEN v_ws_chk_02 ELSE v_ws_chk_01 END,
             'RISK_CALCULATED', 'Risk assessment completed', 'Success', NOW() - (i || ' day')::INTERVAL - ((i * 37 + 25) || ' minute')::INTERVAL),
            (v_session_id, CASE WHEN i % 3 = 0 THEN v_m_dewan_id WHEN i % 5 = 0 THEN v_a_bose_id ELSE v_rajesh_id END,
             CASE WHEN i % 5 = 0 THEN v_chk_silg WHEN i % 3 = 0 THEN v_chk_doc WHEN i % 7 = 0 THEN v_chk_sec ELSE v_chk_jalp END,
             CASE WHEN i % 2 = 0 THEN v_ws_chk_02 ELSE v_ws_chk_01 END,
             'DECISION_RECORDED', 'Decision recorded: ' || CASE WHEN i % 7 = 0 THEN 'REVIEW' WHEN i % 13 = 0 THEN 'REJECTED' ELSE 'VERIFIED' END,
             CASE WHEN i % 7 = 0 THEN 'Review' WHEN i % 13 = 0 THEN 'Rejected' ELSE 'Success' END,
             NOW() - (i || ' day')::INTERVAL - ((i * 37 + 30) || ' minute')::INTERVAL);
        END IF;
    END LOOP;
END $$;

-- Insert system events
INSERT INTO system_events (component, status, message) VALUES
('Desktop Application', 'Operational', 'Electron main process running'),
('Authentication Service', 'Active', 'Supabase Auth connected'),
('Database', 'Connected', 'PostgreSQL via Supabase'),
('Node AI Service', 'Operational', 'Port 3001 · CORS restricted'),
('Camera', 'Connected', 'Device: Integrated Webcam'),
('Python Verification Engine', 'Operational', 'Local engine ready'),
('OCR Engine', 'Ready', 'Tesseract 5.3 · Hindi + English'),
('Face Recognition Engine', 'Ready', 'SCRFD + ArcFace local model'),
('MRZ Parser', 'Active', 'ICAO 9303 · TD1/TD2/TD3'),
('AI Document Analysis', 'Available', 'Remote endpoint · Metadata only')
ON CONFLICT DO NOTHING;
