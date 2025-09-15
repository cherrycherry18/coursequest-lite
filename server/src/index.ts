import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import coursesRouter from './routes/courses.js';
import compareRouter from './routes/compare.js';
import ingestRouter from './routes/ingest.js';
import askRouter from './routes/ask.js';

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/courses', coursesRouter);
app.use('/api/compare', compareRouter);
app.use('/api/ingest', ingestRouter);
app.use('/api/ask', askRouter);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
});


