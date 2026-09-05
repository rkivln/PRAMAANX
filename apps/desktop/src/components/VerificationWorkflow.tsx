import { StepIndicator } from '@/components';
import StepDocumentCapture from '@/components/StepDocumentCapture';
import StepDocumentProcessing from '@/components/StepDocumentProcessing';
import StepFaceCapture from '@/components/StepFaceCapture';
import StepBiometricProcessing from '@/components/StepBiometricProcessing';
import StepResult from '@/components/StepResult';
import { useVerificationStore } from '@/store/verification';

export default function VerificationWorkflow() {
  const currentStep = useVerificationStore((s: any) => s.currentStep);

  return (
    <div className="flex flex-col flex-1">
      <StepIndicator currentStep={currentStep} />
      <div className="flex-1 overflow-y-auto">
        {currentStep === 1 && <StepDocumentCapture />}
        {currentStep === 2 && <StepDocumentProcessing />}
        {currentStep === 3 && <StepFaceCapture />}
        {currentStep === 4 && <StepBiometricProcessing />}
        {currentStep === 5 && <StepResult />}
      </div>
    </div>
  );
}
