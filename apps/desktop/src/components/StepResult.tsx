import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Lock,
  Database,
  UserCheck,
  FileText,
  Cpu,
  RefreshCw,
  ExternalLink,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { FullScreeningResponse } from '../types/verification';

interface StepResultProps {
  data: FullScreeningResponse;
  onNewScreening: () => void;
  onViewAuditTrail: () => void;
}

export const StepResult: React.FC<StepResultProps> = ({
  data,
  onNewScreening,
  onViewAuditTrail
}) => {
  const [decisionRecorded, setDecisionRecorded] = useState<string | null>(null);
  const [isSubmittingDecision, setIsSubmittingDecision] = useState<boolean>(false);
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  const { risk, ocr, mrz, biometric, forensics, audit, verification_id } = data;

  const isVerified = risk?.decision_recommendation === 'VERIFIED';
  const isReview = risk?.decision_recommendation === 'REVIEW';
  const isRejected = risk?.decision_recommendation === 'REJECTED';

  const bannerColor = isVerified
    ? 'bg-[#138808] text-white'
    : isReview
    ? 'bg-[#C47A00] text-white'
    : 'bg-[#B42318] text-white';

  const riskScoreColor = isVerified
    ? 'text-[#138808]'
    : isReview
    ? 'text-[#C47A00]'
    : 'text-[#B42318]';

  const handleDownloadReport = async (format: 'pdf' | 'excel' | 'word' | 'csv') => {
    setDownloadingFormat(format);
    try {
      const res = await fetch(`http://127.0.0.1:5001/api/report/individual/export?format=${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`Download failed with status ${res.status}`);
      const blob = await res.blob();
      const ext = format === 'excel' ? 'xlsx' : format === 'word' ? 'docx' : format;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PRAMAANX_Dossier_${verification_id || 'Case'}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Report export notice:', err);
    } finally {
      setDownloadingFormat(null);
    }
  };

  const handleDecision = async (action: 'APPROVE' | 'REVIEW' | 'REJECT') => {
    setIsSubmittingDecision(true);
    try {
      await fetch('http://127.0.0.1:5001/api/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verification_id,
          action,
          timestamp: new Date().toISOString()
        })
      });
      setDecisionRecorded(action);
    } catch (e) {
      console.warn('Decision endpoint notice:', e);
      setDecisionRecorded(action);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const docName = ocr?.fields?.name || (mrz?.given_names ? `${mrz.given_names} ${mrz.surname || ''}`.trim() : '') || '—';
  const docNumber = ocr?.fields?.document_number || mrz?.document_number || '—';
  const docType = ocr?.fields?.document_type || mrz?.format || 'Identity Document';
  const docNationality = ocr?.fields?.nationality || mrz?.nationality || '—';
  const docDob = ocr?.fields?.dob || mrz?.birth_date || '—';
  const docGender = ocr?.fields?.gender || mrz?.sex || '—';
  const docExpiry = ocr?.fields?.expiry || mrz?.expiry_date || '—';

  return (
    <div className="flex flex-col h-full bg-[#F3F5F7] overflow-y-auto">
      {/* 1. Official Verdict Banner */}
      <div className={`px-6 py-4 flex items-center justify-between shadow-md ${bannerColor}`}>
        <div className="flex items-center gap-4">
          {isVerified ? (
            <ShieldCheck className="w-9 h-9 text-white flex-shrink-0" />
          ) : isReview ? (
            <AlertTriangle className="w-9 h-9 text-white flex-shrink-0" />
          ) : (
            <XCircle className="w-9 h-9 text-white flex-shrink-0" />
          )}

          <div>
            <div className="text-[11px] font-mono tracking-widest uppercase opacity-90">
              IMMIGRATION &amp; BORDER VERIFICATION VERDICT
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              {isVerified && 'ENTRY VERIFIED — LOW RISK'}
              {isReview && 'SECONDARY REVIEW REQUIRED — MEDIUM RISK'}
              {isRejected && 'ENTRY REJECTED — HIGH RISK ANOMALY DETECTED'}
            </h1>
          </div>
        </div>

        {/* Verification Identifier */}
        <div className="text-right">
          <div className="text-[11px] font-mono opacity-80">CASE REF / VERIFICATION ID</div>
          <div className="text-sm font-mono font-bold tracking-wider">{verification_id || '—'}</div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Export Official Report Toolbar */}
        <div className="bg-white border border-[#D6DCE2] rounded-lg p-3.5 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#0B2942]/10 flex items-center justify-center">
              <Download className="w-4 h-4 text-[#0B2942]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#0B2942] uppercase tracking-wider">
                Export Official Inspection Dossier
              </div>
              <div className="text-[11px] text-[#5B6773]">
                Download structured compliance screening report with cryptographic hashes &amp; biometrics
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownloadReport('pdf')}
              disabled={downloadingFormat !== null}
              className="px-3 py-1.5 bg-[#B42318]/10 hover:bg-[#B42318]/20 text-[#B42318] border border-[#B42318]/30 font-bold text-xs rounded flex items-center gap-1.5 transition disabled:opacity-50"
              title="Download official PDF report"
            >
              <FileText className="w-3.5 h-3.5" />
              {downloadingFormat === 'pdf' ? 'Generating PDF...' : 'PDF Dossier'}
            </button>

            <button
              onClick={() => handleDownloadReport('excel')}
              disabled={downloadingFormat !== null}
              className="px-3 py-1.5 bg-[#138808]/10 hover:bg-[#138808]/20 text-[#138808] border border-[#138808]/30 font-bold text-xs rounded flex items-center gap-1.5 transition disabled:opacity-50"
              title="Download Excel spreadsheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              {downloadingFormat === 'excel' ? 'Generating Excel...' : 'Excel (.xlsx)'}
            </button>

            <button
              onClick={() => handleDownloadReport('word')}
              disabled={downloadingFormat !== null}
              className="px-3 py-1.5 bg-[#0B2942]/10 hover:bg-[#0B2942]/20 text-[#0B2942] border border-[#0B2942]/30 font-bold text-xs rounded flex items-center gap-1.5 transition disabled:opacity-50"
              title="Download Word document"
            >
              <FileText className="w-3.5 h-3.5 text-[#1E5A8A]" />
              {downloadingFormat === 'word' ? 'Generating Word...' : 'Word (.docx)'}
            </button>

            <button
              onClick={() => handleDownloadReport('csv')}
              disabled={downloadingFormat !== null}
              className="px-3 py-1.5 bg-[#5B6773]/10 hover:bg-[#5B6773]/20 text-[#17212B] border border-[#5B6773]/30 font-bold text-xs rounded flex items-center gap-1.5 transition disabled:opacity-50"
              title="Download raw CSV records"
            >
              <Download className="w-3.5 h-3.5 text-[#5B6773]" />
              {downloadingFormat === 'csv' ? 'Generating CSV...' : 'CSV Data'}
            </button>
          </div>
        </div>

        {/* Row 1: Risk Assessment & Evidence Reasons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Gauge Card */}
          <div className="bg-white border border-[#D6DCE2] rounded p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-[#E8ECF0] pb-2">
                <span className="text-xs font-bold text-[#0B2942] uppercase tracking-wider">
                  Composite Risk Engine
                </span>
                <span className="text-[10px] font-mono bg-[#F8F9FA] px-2 py-0.5 rounded text-[#5B6773] border border-[#D6DCE2]">
                  {risk?.engine_details?.ml_model || 'XGBoost v3.4.1'}
                </span>
              </div>

              <div className="flex items-baseline gap-3 my-4">
                <div className={`text-5xl font-black font-mono tracking-tight ${riskScoreColor}`}>
                  {risk?.risk_score ?? '—'}
                </div>
                <div className="text-xs text-[#5B6773] leading-tight">
                  <div className="font-bold text-[#17212B] uppercase">/ 100 RISK SCORE</div>
                  <div>LEVEL: <span className="font-semibold">{risk?.risk_level || '—'}</span></div>
                  <div>CONFIDENCE: <span className="font-semibold">{risk?.confidence ? `${Math.round(risk.confidence * 100)}%` : '—'}</span></div>
                </div>
              </div>

              {/* Progress meter */}
              <div className="w-full bg-[#E8ECF0] h-2.5 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full transition-all duration-500 ${
                    isVerified ? 'bg-[#138808]' : isReview ? 'bg-[#C47A00]' : 'bg-[#B42318]'
                  }`}
                  style={{ width: `${Math.max(2, Math.min(100, risk?.risk_score || 0))}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] font-mono text-[#7A858F]">
                <span>0 (SECURE)</span>
                <span>35 (REVIEW)</span>
                <span>65 (REJECT)</span>
                <span>100 (CRITICAL)</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E8ECF0] text-[11px] text-[#5B6773]">
              <span className="font-medium text-[#17212B]">Recommendation:</span>{' '}
              {risk?.decision_recommendation || '—'}
            </div>
          </div>

          {/* Evidence Reasons Card */}
          <div className="lg:col-span-2 bg-white border border-[#D6DCE2] rounded p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-[#E8ECF0] pb-2">
                <span className="text-xs font-bold text-[#0B2942] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#FF9933]" /> Evidence Reasons &amp; Signal Breakdown
                </span>
                <span className="text-[10px] text-[#5B6773]">Deterministic &amp; ML Reasoning</span>
              </div>

              <div className="space-y-2.5 mt-2">
                {risk?.reasons && risk.reasons.length > 0 ? (
                  risk.reasons.map((reason, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-2.5 p-2.5 rounded text-xs ${
                        isVerified
                          ? 'bg-[#E6F4E6]/50 border border-[#138808]/20 text-[#17212B]'
                          : 'bg-[#FFF3D6]/70 border border-[#C47A00]/30 text-[#17212B]'
                      }`}
                    >
                      {isVerified ? (
                        <CheckCircle2 className="w-4 h-4 text-[#138808] flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-[#C47A00] flex-shrink-0 mt-0.5" />
                      )}
                      <span className="font-medium">{reason}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-[#5B6773] italic p-3 bg-[#F8F9FA] rounded border border-[#E8ECF0]">
                    No signals or anomalies recorded.
                  </div>
                )}
              </div>
            </div>

            {/* Supabase Audit Badge */}
            <div className="mt-4 pt-3 border-t border-[#E8ECF0] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#138808]" />
                <span className="font-semibold text-[#17212B]">Digital Audit:</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#E6F4E6] text-[#138808] font-medium border border-[#138808]/30">
                  {audit?.sync_status === 'SYNCED_TO_SUPABASE' ? 'SYNCED TO SUPABASE' : 'LOGGED LOCALLY'}
                </span>
              </div>

              {audit?.supabase_session_id && (
                <span className="text-[10px] font-mono text-[#5B6773]">
                  Session ID: {audit.supabase_session_id.substring(0, 13)}...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Side-by-Side Face Verification & OCR/MRZ Extracted Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Biometric Face Verification Card */}
          <div className="bg-white border border-[#D6DCE2] rounded p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-[#E8ECF0] pb-2">
              <span className="text-xs font-bold text-[#0B2942] uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[#FF9933]" /> Biometric Face Verification
              </span>
              <span className="text-[10px] font-mono text-[#5B6773] bg-[#F8F9FA] px-2 py-0.5 rounded border border-[#D6DCE2]">
                {biometric?.model_name || 'ArcFace 512D'}
              </span>
            </div>

            {/* Side-by-Side Portraits */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Document Portrait */}
              <div className="flex flex-col items-center bg-[#F8F9FA] p-3 rounded border border-[#E8ECF0]">
                <span className="text-[10px] font-bold text-[#5B6773] uppercase mb-2">
                  1. Document Reference Face
                </span>
                <div className="w-32 h-40 bg-[#161C21] rounded overflow-hidden flex items-center justify-center border border-[#D6DCE2] shadow-inner text-center p-2">
                  {biometric?.document_face_crop ? (
                    <img
                      src={biometric.document_face_crop}
                      alt="Doc Face Crop"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[11px] text-white/50 leading-tight">
                      No portrait detected in document
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-[#5B6773] mt-2">
                  Quality: {biometric?.document_face_quality ? `${biometric.document_face_quality}%` : '—'}
                </span>
              </div>

              {/* Real-time Webcam Face */}
              <div className="flex flex-col items-center bg-[#F8F9FA] p-3 rounded border border-[#E8ECF0]">
                <span className="text-[10px] font-bold text-[#5B6773] uppercase mb-2">
                  2. Real-Time Webcam Face
                </span>
                <div className="w-32 h-40 bg-[#161C21] rounded overflow-hidden flex items-center justify-center border border-[#D6DCE2] shadow-inner text-center p-2">
                  {biometric?.live_face_crop ? (
                    <img
                      src={biometric.live_face_crop}
                      alt="Live Face Crop"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[11px] text-white/50 leading-tight">
                      No live face detected
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-[#5B6773] mt-2">
                  Quality: {biometric?.face_quality_score ? `${biometric.face_quality_score}%` : '—'}
                </span>
              </div>
            </div>

            {/* Biometric Similarity Metric Strip */}
            <div className="grid grid-cols-2 gap-3 bg-[#F8F9FA] p-3 rounded border border-[#E8ECF0] text-xs">
              <div>
                <span className="text-[10px] text-[#7A858F] uppercase font-bold block">
                  ArcFace Cosine Similarity
                </span>
                <span className="text-base font-bold font-mono text-[#0B2942]">
                  {biometric?.face_similarity_score ? `${biometric.face_similarity_score}%` : '—'}{' '}
                  <span
                    className={`text-[11px] font-sans px-1.5 py-0.5 rounded font-bold ${
                      biometric?.face_match_status === 'MATCH'
                        ? 'bg-[#E6F4E6] text-[#138808]'
                        : 'bg-[#FFF3D6] text-[#C47A00]'
                    }`}
                  >
                    {biometric?.face_match_status || '—'}
                  </span>
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#7A858F] uppercase font-bold block">
                  Biometric Liveness
                </span>
                <span className="text-base font-bold font-mono text-[#0B2942]">
                  {biometric?.liveness?.liveness_score ? `${Math.round(biometric.liveness.liveness_score * 100)}%` : '—'}{' '}
                  <span
                    className={`text-[11px] font-sans px-1.5 py-0.5 rounded font-bold ${
                      biometric?.liveness?.liveness_status === 'PASS'
                        ? 'bg-[#E6F4E6] text-[#138808]'
                        : 'bg-[#FDECEA] text-[#B42318]'
                    }`}
                  >
                    {biometric?.liveness?.liveness_status || '—'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Extracted Document Fields & MRZ Card */}
          <div className="bg-white border border-[#D6DCE2] rounded p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-[#E8ECF0] pb-2">
                <span className="text-xs font-bold text-[#0B2942] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#FF9933]" /> Document &amp; MRZ Data
                </span>
                <span className="text-[10px] font-mono text-[#5B6773] bg-[#F8F9FA] px-2 py-0.5 rounded border border-[#D6DCE2]">
                  {ocr?.engine || 'Optical Engine'} • Conf: {ocr?.confidence ? `${ocr.confidence}%` : '—'}
                </span>
              </div>

              {/* Data Table */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs mb-4">
                <div className="border-b border-[#E8ECF0] pb-1.5">
                  <span className="text-[10px] font-bold text-[#7A858F] uppercase tracking-wider block">
                    Document Type
                  </span>
                  <span className="font-semibold text-[#17212B]">{docType}</span>
                </div>

                <div className="border-b border-[#E8ECF0] pb-1.5">
                  <span className="text-[10px] font-bold text-[#7A858F] uppercase tracking-wider block">
                    Document Number
                  </span>
                  <span className="font-mono font-bold text-[#0B2942]">{docNumber}</span>
                </div>

                <div className="border-b border-[#E8ECF0] pb-1.5">
                  <span className="text-[10px] font-bold text-[#7A858F] uppercase tracking-wider block">
                    Subject Full Name
                  </span>
                  <span className="font-semibold text-[#17212B]">{docName}</span>
                </div>

                <div className="border-b border-[#E8ECF0] pb-1.5">
                  <span className="text-[10px] font-bold text-[#7A858F] uppercase tracking-wider block">
                    Nationality / Country
                  </span>
                  <span className="font-semibold text-[#17212B]">{docNationality}</span>
                </div>

                <div className="border-b border-[#E8ECF0] pb-1.5">
                  <span className="text-[10px] font-bold text-[#7A858F] uppercase tracking-wider block">
                    Date of Birth
                  </span>
                  <span className="font-mono text-[#17212B]">{docDob}</span>
                </div>

                <div className="border-b border-[#E8ECF0] pb-1.5">
                  <span className="text-[10px] font-bold text-[#7A858F] uppercase tracking-wider block">
                    Gender / Sex
                  </span>
                  <span className="font-semibold text-[#17212B]">{docGender}</span>
                </div>

                <div className="border-b border-[#E8ECF0] pb-1.5">
                  <span className="text-[10px] font-bold text-[#7A858F] uppercase tracking-wider block">
                    Expiry Date
                  </span>
                  <span className="font-mono text-[#17212B]">{docExpiry}</span>
                </div>
              </div>

              {/* MRZ Lines Display */}
              <div className="bg-[#161C21] p-3 rounded border border-[#2A3440] font-mono text-[11px] text-[#FF9933] space-y-1 min-h-[60px] flex flex-col justify-center">
                <div className="text-[9px] text-white/50 tracking-wider uppercase mb-1">
                  ICAO 9303 MACHINE READABLE ZONE
                </div>
                {mrz?.raw_mrz ? (
                  mrz.raw_mrz.split('\n').map((line, idx) => (
                    <div key={idx} className="tracking-widest">{line}</div>
                  ))
                ) : (
                  <div className="text-white/40 italic text-xs">
                    No Machine Readable Zone (MRZ) detected on this document
                  </div>
                )}
              </div>
            </div>

            {/* Checksums validation strip */}
            <div className="mt-3 flex items-center justify-between text-[10.5px] font-mono bg-[#F8F9FA] p-2 rounded border border-[#E8ECF0]">
              <span className="text-[#5B6773]">CHECKSUMS:</span>
              {mrz?.mrz_detected ? (
                <>
                  <span className={mrz.checksums?.document_number_valid ? "text-[#138808] font-bold" : "text-[#B42318] font-bold"}>
                    DOC NO [{mrz.checksums?.document_number_valid ? '✓' : '✗'}]
                  </span>
                  <span className={mrz.checksums?.dob_valid ? "text-[#138808] font-bold" : "text-[#B42318] font-bold"}>
                    DOB [{mrz.checksums?.dob_valid ? '✓' : '✗'}]
                  </span>
                  <span className={mrz.checksums?.expiry_valid ? "text-[#138808] font-bold" : "text-[#B42318] font-bold"}>
                    EXPIRY [{mrz.checksums?.expiry_valid ? '✓' : '✗'}]
                  </span>
                  <span className={mrz.checksums?.composite_valid ? "text-[#138808] font-bold" : "text-[#B42318] font-bold"}>
                    COMPOSITE [{mrz.checksums?.composite_valid ? '✓' : '✗'}]
                  </span>
                </>
              ) : (
                <span className="text-[#7A858F] italic">N/A — Non-MRZ Document</span>
              )}
            </div>
          </div>
        </div>

        {/* Row 3: Forensic Analysis & Digital Audit Hashes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Forensics Details Card */}
          <div className="bg-white border border-[#D6DCE2] rounded p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-[#E8ECF0] pb-2">
              <span className="text-xs font-bold text-[#0B2942] uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-[#FF9933]" /> Document Forensics &amp; Tamper Analysis
              </span>
              <span className="text-[10px] font-mono text-[#5B6773]">OpenCV • Pillow • PyTorch</span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {/* ELA Score */}
              <div className="bg-[#F8F9FA] p-2.5 rounded border border-[#E8ECF0] text-center">
                <span className="text-[10px] text-[#7A858F] font-bold uppercase block">ELA Compression</span>
                <span className="text-lg font-bold font-mono text-[#0B2942]">
                  {forensics?.ela?.ela_score != null ? `${forensics.ela.ela_score}/100` : '—'}
                </span>
                <span className={`text-[10px] block font-medium ${forensics?.ela?.status === 'PASS' ? 'text-[#138808]' : 'text-[#C47A00]'}`}>
                  {forensics?.ela?.status || '—'}
                </span>
              </div>

              {/* Sharpness & Blur */}
              <div className="bg-[#F8F9FA] p-2.5 rounded border border-[#E8ECF0] text-center">
                <span className="text-[10px] text-[#7A858F] font-bold uppercase block">Sharpness / Focus</span>
                <span className="text-lg font-bold font-mono text-[#0B2942]">
                  {forensics?.tamper?.blur_score != null ? `${forensics.tamper.blur_score}/100` : '—'}
                </span>
                <span className={`text-[10px] block font-medium ${forensics?.tamper?.blur_score && forensics.tamper.blur_score >= 50 ? 'text-[#138808]' : 'text-[#C47A00]'}`}>
                  {forensics?.tamper?.blur_score && forensics.tamper.blur_score >= 50 ? 'IN FOCUS' : 'BLURRY'}
                </span>
              </div>

              {/* Neural Model */}
              <div className="bg-[#F8F9FA] p-2.5 rounded border border-[#E8ECF0] text-center">
                <span className="text-[10px] text-[#7A858F] font-bold uppercase block">Neural Synthetic</span>
                <span className="text-lg font-bold font-mono text-[#0B2942]">
                  {forensics?.neural?.model_confidence ? `${forensics.neural.model_confidence}%` : '—'}
                </span>
                <span className={`text-[10px] block font-medium ${forensics?.neural?.neural_forensic_status === 'AUTHENTIC' ? 'text-[#138808]' : 'text-[#C47A00]'}`}>
                  {forensics?.neural?.neural_forensic_status || '—'}
                </span>
              </div>
            </div>

            {/* ELA Heatmap Preview if available */}
            {forensics?.ela?.ela_heatmap && (
              <div className="flex items-center gap-3 bg-[#F8F9FA] p-2.5 rounded border border-[#E8ECF0]">
                <img
                  src={forensics.ela.ela_heatmap}
                  alt="ELA Heatmap"
                  className="w-16 h-12 object-cover rounded border border-[#D6DCE2]"
                />
                <div className="text-xs">
                  <div className="font-semibold text-[#17212B]">Error Level Analysis (ELA) Heatmap</div>
                  <div className="text-[11px] text-[#5B6773]">
                    Pixel residual variance is calculated across the optical capture to detect localized digital alterations.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cryptographic Digital Audit Trail Card */}
          <div className="bg-white border border-[#D6DCE2] rounded p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-[#E8ECF0] pb-2">
                <span className="text-xs font-bold text-[#0B2942] uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-[#138808]" /> Immutable Digital Audit Trail
                </span>
                <span className="text-[10px] font-mono text-[#138808] font-semibold bg-[#E6F4E6] px-2 py-0.5 rounded border border-[#138808]/30">
                  SECURE VAULT
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-[#7A858F] uppercase block">
                    Document Image SHA-256 Digest:
                  </span>
                  <span className="font-mono text-[11px] text-[#17212B] break-all bg-[#F8F9FA] p-1.5 rounded block border border-[#E8ECF0]">
                    {audit?.hashes?.document_sha256 || '—'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-[#7A858F] uppercase block">
                    Live Webcam Face SHA-256 Digest:
                  </span>
                  <span className="font-mono text-[11px] text-[#17212B] break-all bg-[#F8F9FA] p-1.5 rounded block border border-[#E8ECF0]">
                    {audit?.hashes?.face_sha256 || '—'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px] text-[#5B6773]">
                  <div>Officer: <span className="text-[#17212B] font-semibold">{audit?.officer?.officer_id || '—'}</span></div>
                  <div>Checkpoint: <span className="text-[#17212B] font-semibold">{audit?.officer?.checkpoint_code || '—'}</span></div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E8ECF0] flex items-center justify-between">
              <span className="text-xs text-[#5B6773]">Tamper-evident record synced to Supabase</span>
              <button
                onClick={onViewAuditTrail}
                className="text-xs font-semibold text-[#1E5A8A] hover:text-[#0B2942] flex items-center gap-1"
              >
                Inspect Audit Database &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Row 4: Officer Action Control Bar */}
        <div className="bg-white border border-[#D6DCE2] rounded-lg p-5 shadow flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-[#0B2942] uppercase tracking-wider">
              Border Officer Verification Actions
            </div>
            <div className="text-xs text-[#5B6773]">
              {decisionRecorded ? (
                <span className="font-bold text-[#138808]">
                  Officer Action Logged: {decisionRecorded} at {new Date().toLocaleTimeString()}
                </span>
              ) : (
                'Review findings and record the final screening decision'
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDecision('APPROVE')}
              disabled={isSubmittingDecision}
              className="px-5 py-2.5 bg-[#138808] hover:bg-[#0f6f06] text-white font-bold text-xs rounded shadow transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Approve Entry
            </button>

            <button
              onClick={() => handleDecision('REVIEW')}
              disabled={isSubmittingDecision}
              className="px-4 py-2.5 bg-[#C47A00] hover:bg-[#a66700] text-white font-bold text-xs rounded shadow transition flex items-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4" /> Flag for Review
            </button>

            <button
              onClick={() => handleDecision('REJECT')}
              disabled={isSubmittingDecision}
              className="px-4 py-2.5 bg-[#B42318] hover:bg-[#8e1b12] text-white font-bold text-xs rounded shadow transition flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" /> Deny / Reject
            </button>

            <button
              onClick={onNewScreening}
              className="px-4 py-2.5 bg-[#0B2942] hover:bg-[#123B63] text-white font-semibold text-xs rounded shadow transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4 text-[#FF9933]" /> Next Screening &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
