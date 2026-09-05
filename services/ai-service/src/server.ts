import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import analysisRouter from './routes/analysis';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(morgan('combined'));
app.use(express.json({ limit: '1mb' }));

app.use('/api/analysis', analysisRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'pramaanx-ai-service', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`AI Service running on port ${PORT}`);
});
