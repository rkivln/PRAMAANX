import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

interface AnalysisRequest {
  verification_id: string;
  document_type: string;
  ocr_text: string;
  ocr_confidence: number;
  authenticity_score: number;
  tamper_status: string;
  face_similarity: number;
  liveness_status: string;
  risk_level: string;
}

router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const payload: AnalysisRequest = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: true,
        data: {
          opinion: 'AI analysis unavailable: GEMINI_API_KEY not configured',
          confidence: 0.0,
          provider: 'none',
        },
      });
    }

    const prompt = `You are a supporting analysis engine for a government identity verification system.
Do NOT make final decisions. Provide structured observations only.

Document Type: ${payload.document_type}
OCR Confidence: ${payload.ocr_confidence}%
Authenticity Score: ${payload.authenticity_score}%
Tamper Status: ${payload.tamper_status}
Face Similarity: ${payload.face_similarity}%
Liveness Status: ${payload.liveness_status}
Risk Level: ${payload.risk_level}

Provide a brief structured opinion with confidence level (0.0-1.0).`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const opinion = response.text();

    res.json({
      success: true,
      data: {
        opinion,
        confidence: 0.7,
        provider: 'gemini',
        model: 'gemini-pro',
      },
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    res.json({
      success: true,
      data: {
        opinion: 'AI analysis encountered an error',
        confidence: 0.0,
        provider: 'error',
      },
    });
  }
});

export default router;
