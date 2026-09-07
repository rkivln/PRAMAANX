import React, { useEffect, useState } from 'react';
import { Shield, CheckCircle2, Loader2, Cpu, Eye, FileText, Database } from 'lucide-react';

interface StepProcessingProps {
  onComplete?: () => void;
}

interface PipelineStep {
  id: string;
  label: string;
  engine: string;
  icon: React.ElementType;
}

const PIPELINE_STEPS: PipelineStep[] = [
  { id: 'ocr', label: 'PaddleOCR Text Extraction & Field Parsing', engine: 'PaddleOCR v3.7', icon: FileText },
  { id: 'mrz', label: 'ICAO 9303 Machine Readable Zone (MRZ) Checksum Validation', engine: 'ICAO TD1/TD2/TD3 Parser', icon: Shield },
  { id: 'arcface', label: 'Biometric Face Extraction & ArcFace Cosine Match', engine: 'InsightFace + ArcFace 512D', icon: Eye },
  { id: 'liveness', label: 'Passive Biometric Liveness & Moiré Frequency Check', engine: 'FFT 2D Spectrum + LBP', icon: Eye },
  { id: 'forensics', label: 'Document Forensics (Error Level Analysis ELA & Tamper)', engine: 'Pillow ELA + OpenCV Laplacian', icon: Cpu },
  { id: 'neural', label: 'PyTorch Visual Forensic Residual Anomaly Network', engine: 'PyTorch CNN-Residual Net', icon: Cpu },
  { id: 'metadata', label: 'Metadata & Software Alteration Signature Scan', engine: 'PyMuPDF + Pillow EXIF', icon: FileText },
  { id: 'risk', label: 'XGBoost Multi-Modal Composite Risk Engine', engine: 'Python + XGBoost v3.4.1', icon: Shield },
  { id: 'audit', label: 'Cryptographic SHA-256 Digest & Supabase Digital Audit', engine: 'Supabase PostgreSQL Client', icon: Database },
];

export const StepProcessing: React.FC<StepProcessingProps> = () => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStepIndex((prev) => {
        if (prev < PIPELINE_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 280);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#0B2942] text-white items-center justify-center p-8 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Radar Scanner Graphic */}
      <div className="relative w-36 h-36 mb-8 flex items-center justify-center">
        {/* Outer rings */}
        <div className="absolute inset-0 rounded-full border border-white/20" />
        <div className="absolute inset-4 rounded-full border border-white/15" />
        <div className="absolute inset-8 rounded-full border border-white/10" />

        {/* Crosshairs */}
        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/15" />
        <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-white/15" />

        {/* Rotating Radar Sweep */}
        <div className="absolute inset-0 rounded-full animate-radar pointer-events-none">
          <div className="w-1/2 h-1/2 bg-gradient-to-br from-[#FF9933]/40 to-transparent rounded-tl-full origin-bottom-right" />
        </div>

        {/* Center Emblem Icon */}
        <Shield className="w-10 h-10 text-[#FF9933] relative z-10 drop-shadow" />
      </div>

      {/* Title & Status */}
      <h2 className="text-xl font-bold tracking-wide text-white mb-1">
        PRAMAANX LOCAL INFERENCE ENGINE
      </h2>
      <p className="text-xs font-mono text-white/70 mb-8 tracking-wider">
        EXECUTING MULTI-MODAL VERIFICATION &bull; LOCAL OFFLINE PROCESSING
      </p>

      {/* Execution Pipeline Steps Card */}
      <div className="w-full max-w-xl bg-[#123B63]/90 border border-white/15 rounded-lg p-5 shadow-2xl backdrop-blur-sm">
        <div className="space-y-2.5">
          {PIPELINE_STEPS.map((step, idx) => {
            const isCompleted = idx < activeStepIndex;
            const isCurrent = idx === activeStepIndex;
            const StepIcon = step.icon;

            return (
              <div
                key={step.id}
                className={`flex items-center justify-between px-3.5 py-2 rounded text-xs transition-all duration-200 ${
                  isCurrent
                    ? 'bg-[#1E5A8A] border border-[#FF9933]/60 text-white shadow'
                    : isCompleted
                    ? 'bg-black/20 text-white/90 border border-transparent'
                    : 'text-white/40 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-[#138808] flex-shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-[#FF9933] animate-spin flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-white/30 flex-shrink-0" />
                  )}
                  <span className="font-medium text-[12px]">{step.label}</span>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/30 text-white/75 flex-shrink-0">
                  {step.engine}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
