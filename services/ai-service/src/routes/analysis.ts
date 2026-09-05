import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const OpinionRequestSchema = z.object({
  verification_id: z.string(),
  document_type: z.string(),
  document_findings: z.object({
    ocr_confidence: z.number().optional(),
    authenticity_score: z.number().optional(),
    tamper_status: z.string().optional(),
    mrz_status: z.string().optional(),
  }).optional(),
  forensic_findings: z.object({
    ela_score: z.number().optional(),
    splice_score: z.number().optional(),
    metadata_anomaly_score: z.number().optional(),
  }).optional(),
  cross_stream_findings: z.array(z.object({
    check_id: z.string(),
    status: z.string(),
    severity: z.string(),
  })).optional(),
  biometric_findings: z.object({
    face_similarity_score: z.number().optional(),
    liveness_status: z.string().optional(),
    face_quality_score: z.number().optional(),
  }).optional(),
});

router.post('/opinion', async (req, res) => {
  try {
    const payload = OpinionRequestSchema.parse(req.body);

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return res.json({
        success: true,
        data: {
          opinion: 'AI analysis unavailable — Gemini not configured',
          risk_observations: [],
          supporting_findings: [],
          uncertainties: ['Gemini API key not configured'],
          model_name: 'none',
          prompt_version: 'v1.0.0',
          generated_at: new Date().toISOString(),
        },
      });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = buildAnalysisPrompt(payload);

    try {
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return res.json({
        success: true,
        data: {
          opinion: text,
          risk_observations: extractObservations(text),
          supporting_findings: extractFindings(text),
          uncertainties: extractUncertainties(text),
          model_name: 'gemini-1.5-flash',
          prompt_version: 'v1.0.0',
          generated_at: new Date().toISOString(),
        },
      });
    } catch (geminiError) {
      console.error('Gemini generation error:', geminiError);
      return res.json({
        success: true,
        data: {
          opinion: 'AI analysis failed — Gemini service error',
          risk_observations: [],
          supporting_findings: [],
          uncertainties: ['Gemini service error: ' + String(geminiError)],
          model_name: 'gemini-1.5-flash',
          prompt_version: 'v1.0.0',
          generated_at: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Analysis validation error:', error);
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid request payload' },
    });
  }
});

function buildAnalysisPrompt(payload: any): string {
  return `
You are an advisory document analysis assistant for PRAMAANX, a government identity verification system.

IMPORTANT RULES:
1. You are ADVISORY ONLY. You do NOT make final decisions.
2. You do NOT override cryptographic checks, checksum validation, liveness, deterministic rules, or officer decisions.
3. You do NOT receive face images, face embeddings, biometric tensors, or unnecessary PII.
4. Your analysis is based on document metadata, OCR output, forensic findings, and cross-stream consistency only.

VERIFICATION CONTEXT:
- Verification ID: ${payload.verification_id}
- Document Type: ${payload.document_type}

DOCUMENT FINDINGS:
${JSON.stringify(payload.document_findings || {}, null, 2)}

FORENSIC FINDINGS:
${JSON.stringify(payload.forensic_findings || {}, null, 2)}

CROSS-STREAM CONSISTENCY:
${JSON.stringify(payload.cross_stream_findings || [], null, 2)}

BIOMETRIC FINDINGS:
${JSON.stringify(payload.biometric_findings || {}, null, 2)}

Provide a structured analysis with:
1. risk_observations: List of risk-related observations
2. supporting_findings: List of supporting evidence
3. uncertainties: List of uncertainties or limitations

Respond in JSON format only.
`;
}

function extractObservations(text: string): string[] {
  const observations: string[] = [];
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.toLowerCase().includes('risk') || line.toLowerCase().includes('concern') || line.toLowerCase().includes('anomaly')) {
      observations.push(line.trim());
    }
  }
  return observations.slice(0, 5);
}

function extractFindings(text: string): string[] {
  const findings: string[] = [];
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.toLowerCase().includes('consistent') || line.toLowerCase().includes('match') || line.toLowerCase().includes('valid')) {
      findings.push(line.trim());
    }
  }
  return findings.slice(0, 5);
}

function extractUncertainties(text: string): string[] {
  const uncertainties: string[] = [];
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.toLowerCase().includes('uncertain') || line.toLowerCase().includes('unclear') || line.toLowerCase().includes('limited')) {
      uncertainties.push(line.trim());
    }
  }
  return uncertainties.slice(0, 3) || ['Analysis limited by available data'];
}

export default router;
