import { Router } from 'express';
import multer from 'multer';
import { parse } from 'csv-parse';
import { z } from 'zod';
import { prisma } from '../shared/prisma.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const rowSchema = z.object({
  course_id: z.string().min(1),
  course_name: z.string().min(1),
  department: z.string().min(1),
  level: z.enum(['UG', 'PG']),
  delivery_mode: z.enum(['online', 'offline', 'hybrid']),
  credits: z.coerce.number().int().min(0),
  duration_weeks: z.coerce.number().int().min(1),
  rating: z.coerce.number().min(0).max(5),
  tuition_fee_inr: z.coerce.number().min(0),
  year_offered: z.coerce.number().int(),
});

router.post('/', upload.single('file'), async (req, res) => {
  const token = req.headers['x-ingest-token'] as string | undefined;
  if (!token || token !== process.env.INGEST_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'CSV file is required under field name "file"' });
  }
  const text = req.file.buffer.toString('utf8');

  const records: any[] = [];
  await new Promise<void>((resolve, reject) => {
    const parser = parse(text, { columns: true, trim: true, skip_empty_lines: true });
    parser.on('readable', () => {
      let record;
      while ((record = parser.read())) {
        const parsed = rowSchema.safeParse(record);
        if (!parsed.success) {
          reject({ error: 'Invalid row', details: parsed.error.flatten(), record });
          return;
        }
        records.push(parsed.data);
      }
    });
    parser.on('error', (err) => reject(err));
    parser.on('end', () => resolve());
  });

  // Upsert rows
  const operations = records.map((r) =>
    prisma.course.upsert({
      where: { course_id: r.course_id },
      update: r,
      create: r,
    })
  );
  await prisma.$transaction(operations);

  res.json({ inserted: records.length });
});

export default router;


