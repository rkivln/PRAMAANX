import React, { useState } from 'react';
import { Shield, Database, UserCheck, CheckCircle2, Wifi, AlertCircle } from 'lucide-react';
import { StepDocumentCapture } from './components/StepDocumentCapture';
import { StepFaceCapture } from './components/StepFaceCapture';
import { StepProcessing } from './components/StepProcessing';
import { StepResult } from './components/StepResult';
import { AuditTrailView } from './components/AuditTrailView';
import { WorkflowStep, FullScreeningResponse, OfficerInfo } from './types/verification';

const DEFAULT_OFFICER: OfficerInfo = {
  officer_id: 'OFFICER-01',
  name: 'Screening Officer',
  rank: 'Officer',
  checkpoint_code: 'CHK-01'
};

export const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('document');
  const [docImage, setDocImage] = useState<string | null>(null);
  const [docType, setDocType] = useState<string>('Passport');
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [screeningResult, setScreeningResult] = useState<FullScreeningResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Transition from Step 1 (Document) to Step 2 (Face)
  const handleDocumentCaptured = (docDataUri: string, type: string) => {
    setDocImage(docDataUri);
    setDocType(type);
    setCurrentStep('face');
  };

  // Transition from Step 2 (Face) to Step 3 (Processing) & trigger verification
  const handleFaceCaptured = async (faceDataUri: string) => {
    setFaceImage(faceDataUri);
    setCurrentStep('processing');
    setErrorMessage(null);

    try {
      const response = await fetch('http://127.0.0.1:5001/api/verify/full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doc_image: docImage,
          face_image: faceDataUri,
          document_type: docType,
          officer_info: DEFAULT_OFFICER
        })
      });

      if (!response.ok) {
        throw new Error(`Engine returned status ${response.status}`);
      }

      const result: FullScreeningResponse = await response.json();
      setScreeningResult(result);
      // Brief pause to allow operator to observe verification radar completion
      setTimeout(() => {
        setCurrentStep('result');
      }, 1200);
    } catch (err: any) {
      console.error('[Verification Engine Error]', err);
      setErrorMessage(
        `Failed to reach local engine at http://127.0.0.1:5001. Please make sure server.py is running. (${err.message})`
      );
      setCurrentStep('face');
    }
  };

  const handleResetWorkflow = () => {
    setDocImage(null);
    setFaceImage(null);
    setScreeningResult(null);
    setErrorMessage(null);
    setCurrentStep('document');
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#F3F5F7] overflow-hidden">
      {/* 1. Government Border Control Header */}
      <header className="bg-[#0B2942] text-white h-14 px-6 flex items-center justify-between flex-shrink-0 border-t-[3px] border-[#FF9933] shadow-md z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#123B63] border border-white/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#FF9933]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-wider">PRAMAANX</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#FF9933]/20 text-[#FF9933] rounded font-semibold border border-[#FF9933]/40">
                  OFFICIAL MVP
                </span>
              </div>
              <div className="text-[9.5px] text-white/60 tracking-wider font-mono">
                BORDER &amp; IMMIGRATION SCREENING SYSTEM
              </div>
            </div>
          </div>
        </div>

        {/* Center: Officer & Station Badge */}
        <div className="hidden md:flex items-center gap-4 text-xs font-mono">
          <div className="bg-[#123B63] px-3 py-1 rounded border border-white/10 flex items-center gap-2">
            <span className="text-white/50 text-[10px]">CHECKPOINT:</span>
            <span className="font-semibold text-white">{DEFAULT_OFFICER.checkpoint_code}</span>
          </div>

          <div className="bg-[#123B63] px-3 py-1 rounded border border-white/10 flex items-center gap-2">
            <span className="text-white/50 text-[10px]">OFFICER:</span>
            <span className="font-semibold text-white">{DEFAULT_OFFICER.name}</span>
            <span className="text-[10px] text-[#FF9933]">({DEFAULT_OFFICER.officer_id})</span>
          </div>
        </div>

        {/* Right: Engine Telemetry & Ledger Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] font-mono bg-black/30 px-2.5 py-1 rounded text-white/80">
            <span className="w-2 h-2 rounded-full bg-[#138808] animate-pulse" />
            <span>ENGINE: LOCAL 5001</span>
          </div>

          {currentStep === 'audit_history' ? (
            <button
              onClick={() => setCurrentStep('document')}
              className="px-3 py-1.5 bg-[#FF9933] hover:bg-[#e68a2e] text-[#0B2942] font-bold text-xs rounded transition flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" /> Screening Flow
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep('audit_history')}
              className="px-3 py-1.5 bg-[#123B63] hover:bg-[#1E5A8A] text-white font-medium text-xs rounded border border-white/20 transition flex items-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5 text-[#138808]" /> Supabase Audit Ledger
            </button>
          )}
        </div>
      </header>

      {/* 2. Stepper Ribbon (Visible during active screening flow) */}
      {currentStep !== 'audit_history' && (
        <div className="bg-white border-b border-[#D6DCE2] px-6 py-2 flex items-center justify-between text-xs flex-shrink-0">
          <div className="flex items-center gap-6 font-medium">
            <div
              className={`flex items-center gap-2 ${
                currentStep === 'document' ? 'text-[#0B2942] font-bold' : 'text-[#5B6773]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                  currentStep === 'document'
                    ? 'bg-[#0B2942] text-white'
                    : docImage
                    ? 'bg-[#138808] text-white'
                    : 'bg-[#E8ECF0] text-[#5B6773]'
                }`}
              >
                1
              </span>
              <span>Document Scan</span>
            </div>

            <div className="text-[#D6DCE2]">&rarr;</div>

            <div
              className={`flex items-center gap-2 ${
                currentStep === 'face' ? 'text-[#0B2942] font-bold' : 'text-[#5B6773]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                  currentStep === 'face'
                    ? 'bg-[#0B2942] text-white'
                    : faceImage
                    ? 'bg-[#138808] text-white'
                    : 'bg-[#E8ECF0] text-[#5B6773]'
                }`}
              >
                2
              </span>
              <span>Biometric Face Scan</span>
            </div>

            <div className="text-[#D6DCE2]">&rarr;</div>

            <div
              className={`flex items-center gap-2 ${
                currentStep === 'processing' ? 'text-[#0B2942] font-bold' : 'text-[#5B6773]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                  currentStep === 'processing' ? 'bg-[#FF9933] text-[#0B2942]' : 'bg-[#E8ECF0] text-[#5B6773]'
                }`}
              >
                3
              </span>
              <span>Local AI Engine</span>
            </div>

            <div className="text-[#D6DCE2]">&rarr;</div>

            <div
              className={`flex items-center gap-2 ${
                currentStep === 'result' ? 'text-[#0B2942] font-bold' : 'text-[#5B6773]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                  currentStep === 'result' ? 'bg-[#138808] text-white' : 'bg-[#E8ECF0] text-[#5B6773]'
                }`}
              >
                4
              </span>
              <span>Screening Decision</span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-[#5B6773]">
            STATUS: <span className="text-[#138808] font-bold">READY FOR TRAVELER</span>
          </div>
        </div>
      )}

      {/* Error Alert Bar */}
      {errorMessage && (
        <div className="bg-[#FDECEA] border-b border-[#B42318]/30 px-6 py-2.5 flex items-center gap-3 text-xs text-[#B42318]">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* 3. Screen Viewport Switcher */}
      <main className="flex-1 overflow-hidden">
        {currentStep === 'document' && (
          <StepDocumentCapture
            onCaptureComplete={handleDocumentCaptured}
            initialDocImage={docImage || undefined}
            initialDocType={docType}
          />
        )}

        {currentStep === 'face' && (
          <StepFaceCapture
            onCaptureComplete={handleFaceCaptured}
            onBackToDocument={() => setCurrentStep('document')}
            initialFaceImage={faceImage || undefined}
            docImagePreview={docImage || undefined}
          />
        )}

        {currentStep === 'processing' && <StepProcessing />}

        {currentStep === 'result' && screeningResult && (
          <StepResult
            data={screeningResult}
            onNewScreening={handleResetWorkflow}
            onViewAuditTrail={() => setCurrentStep('audit_history')}
          />
        )}

        {currentStep === 'audit_history' && (
          <AuditTrailView onBackToScreening={() => setCurrentStep('document')} />
        )}
      </main>
    </div>
  );
};
