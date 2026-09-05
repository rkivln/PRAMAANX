-- ================================================================
-- PRAMAANX — Development Seed Data
-- ================================================================
-- NOTE: Create users manually in Supabase Dashboard → Authentication
-- Then add officer profiles below matching those auth.user IDs
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

-- Insert officer profiles (replace the IDs below with actual auth.user IDs from Supabase Auth)
-- Example after creating user in Supabase Auth with email rajesh.sharma@pramaanx.gov.in:
-- INSERT INTO officers (id, officer_id, full_name, role, email, rank, unit, active)
-- VALUES ('00000000-0000-0000-0000-000000000001', 'SSB/VER/2024-0142', 'RAJESH SHARMA', 'officer', 'rajesh.sharma@pramaanx.gov.in', 'Constable', 'SSB Sector 5', TRUE)
-- ON CONFLICT (officer_id) DO NOTHING;

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
