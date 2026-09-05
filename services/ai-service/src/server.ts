import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import analysisRouter from './routes/analysis';

dotenv.config();

const app = express();
const PORT = process.env.AI_SERVICE_PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'pramaanx-ai-service',
    version: '1.0.0',
    gemini_available: !!process.env.GEMINI_API_KEY,
  });
});

app.use('/api/analysis', analysisRouter);

app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('AI Service error:', err);
  res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'AI service error' } });
});

const server = app.listen(PORT, () => {
  console.log(`PRAMAANX AI Service running on port ${PORT}`);
});

export { app, server };
