export interface Officer {
  id: string;
  officer_id: string;
  name: string;
  role: 'officer' | 'supervisor' | 'admin';
  email?: string;
  rank?: string;
  unit?: string;
  access_token?: string;
  checkpoint?: {
    code: string;
    name: string;
  };
}

export interface Checkpoint {
  id: string;
  checkpoint_code: string;
  name: string;
  location?: string;
  checkpoint_type?: string;
  status: string;
}

export interface VerificationSession {
  id: string;
  verification_id: string;
  officer_id: string;
  checkpoint_id: string;
  workstation_id?: string;
  status: 'started' | 'processing' | 'pending_review' | 'verified' | 'rejected' | 'cancelled';
  current_step: number;
  started_at: string;
  completed_at?: string;
  demo_mode: boolean;
}

export interface DocumentAnalysis {
  document_type_detected: string;
  ocr_confidence: number;
  pattern_validation_status: string;
  mrz_status: string;
  stamp_status: string;
  tamper_status: string;
  authenticity_score: number;
}

export interface BiometricAnalysis {
  face_detected: boolean;
  face_quality_score: number;
  face_similarity_score: number;
  liveness_score: number;
  liveness_status: string;
  face_match_status: string;
}

export interface RiskAssessment {
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
  decision_recommendation: string;
  reasons: string[];
}

export interface VerificationResult {
  verification_id: string;
  decision: string;
  confidence: number;
  document: DocumentAnalysis;
  biometric: BiometricAnalysis;
  risk: RiskAssessment;
}

export interface VerificationRecord {
  id: string;
  t: string;
  doc: string;
  docNum?: string;
  nm: string;
  dec: 'VERIFIED' | 'REVIEW' | 'REJECTED';
  fm: string;
  authenticity?: string;
  liveness?: string;
  risk: string;
  riskScore?: string;
  off: string;
  st: string;
  docImage?: string;
  docPhoto?: string;
  faceImage?: string;
  timestamp: string;
  checkpoint: string;
  workstation: string;
}

export interface AuditEntry {
  ts: string;
  off: string;
  ev: string;
  vid: string;
  act: string;
  res: string;
  ws: string;
}

export interface SystemComponent {
  name: string;
  detail: string;
  st: string;
  ok: boolean;
}
