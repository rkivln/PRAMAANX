export type WorkflowStep = 'document' | 'face' | 'processing' | 'result' | 'audit_history';

export interface OfficerInfo {
  officer_id: string;
  name: string;
  rank: string;
  checkpoint_code: string;
}

export interface OcrFieldData {
  document_type?: string;
  document_number?: string;
  name?: string;
  dob?: string;
  gender?: string;
  expiry?: string;
  nationality?: string;
  issuing_country?: string;
}

export interface OcrResult {
  engine: string;
  raw_text: string;
  lines: Array<{ text: string; confidence: number }>;
  confidence: number;
  fields: OcrFieldData;
  status: 'PASS' | 'WARN' | 'FAIL';
}

export interface MrzChecksums {
  document_number_valid: boolean;
  dob_valid: boolean;
  expiry_valid: boolean;
  composite_valid: boolean;
}

export interface MrzResult {
  mrz_detected: boolean;
  format: string;
  valid: boolean;
  raw_mrz: string;
  document_type?: string;
  country_code?: string;
  surname?: string;
  given_names?: string;
  document_number?: string;
  nationality?: string;
  birth_date?: string;
  sex?: string;
  expiry_date?: string;
  checksums: MrzChecksums;
  status: 'PASS' | 'FLAGGED';
}

export interface BiometricResult {
  face_detected: boolean;
  face_quality_score: number;
  document_face_quality: number;
  face_similarity_score: number;
  face_match_status: 'MATCH' | 'BORDERLINE' | 'MISMATCH';
  model_name: string;
  model_version: string;
  live_face_crop?: string;
  document_face_crop?: string;
  liveness: {
    liveness_score: number;
    liveness_status: 'PASS' | 'FAIL';
    attack_type: string;
    method?: string;
  };
}

export interface ForensicResult {
  ela: {
    ela_score: number;
    tamper_detected: boolean;
    status: 'PASS' | 'FLAGGED';
    mean_difference?: number;
    max_difference?: number;
    ela_heatmap?: string;
  };
  tamper: {
    tamper_status: 'CLEAN' | 'FLAGGED';
    tamper_confidence: number;
    blur_score: number;
    copy_move_detected: boolean;
    noise_inconsistency: boolean;
    sharpness_variance?: number;
    findings: string[];
  };
  neural: {
    synthetic_probability: number;
    neural_forensic_status: 'AUTHENTIC' | 'SUSPICIOUS';
    model_confidence: number;
    architecture: string;
  };
  metadata: {
    status: 'PASS' | 'FLAGGED';
    software_tampering: boolean;
    detected_software: string;
    anomalies: string[];
    metadata_fields?: Record<string, string>;
  };
}

export interface RiskResult {
  risk_score: number; // 0.0 - 100.0
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
  decision_recommendation: 'VERIFIED' | 'REVIEW' | 'REJECTED';
  reasons: string[];
  positive_signals: string[];
  flagged_signals: string[];
  engine_details?: {
    ml_model: string;
    rules_engine: string;
    xgb_risk_probability: number;
    rule_risk_score: number;
  };
}

export interface AuditRecord {
  verification_id: string;
  timestamp: string;
  sync_status: 'SYNCED_TO_SUPABASE' | 'LOCAL_AUDIT_LOGGED';
  supabase_session_id?: string;
  officer: OfficerInfo;
  hashes: {
    document_sha256: string;
    face_sha256: string;
  };
  document: {
    type: string;
    document_number?: string;
    name?: string;
    mrz_valid: boolean;
    ocr_confidence: number;
  };
  biometrics: {
    face_match_status: string;
    similarity_score: number;
    liveness_status: string;
  };
  forensics: {
    ela_score: number;
    tamper_status: string;
    metadata_status: string;
  };
  risk_assessment: {
    score: number;
    level: string;
    recommendation: string;
    reasons: string[];
  };
}

export interface FullScreeningResponse {
  success: boolean;
  verification_id: string;
  timestamp: string;
  risk: RiskResult;
  ocr: OcrResult;
  mrz: MrzResult;
  biometric: BiometricResult;
  forensics: ForensicResult;
  audit: AuditRecord;
}
