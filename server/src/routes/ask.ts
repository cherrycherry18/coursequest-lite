import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../shared/prisma.js';

const router = Router();

const bodySchema = z.object({ question: z.string().min(3) });

type Filters = {
  department?: string;
  level?: 'UG' | 'PG';
  delivery_mode?: 'online' | 'offline' | 'hybrid';
  max_fee?: number;
  min_rating?: number;
};

function parseQuestion(question: string): Filters {
  const q = question.toLowerCase();
  const filters: Filters = {};

  if (q.includes('pg') || q.includes('postgraduate') || q.includes('masters')) filters.level = 'PG';
  if (q.includes('ug') || q.includes('undergraduate') || q.includes('bachelors')) filters.level = 'UG';

  if (q.includes('online')) filters.delivery_mode = 'online';
  else if (q.includes('offline') || q.includes('on-campus') || q.includes('on campus')) filters.delivery_mode = 'offline';
  else if (q.includes('hybrid')) filters.delivery_mode = 'hybrid';

  const feeMatch = q.match(/under\s*(\d+[\d,]*)\s*(inr|rs|rupees)?|below\s*(\d+[\d,]*)/);
  const feeValue = feeMatch?.[1] ?? feeMatch?.[3];
  if (feeValue) filters.max_fee = Number(feeValue.replace(/,/g, ''));

  const ratingMatch = q.match(/rating\s*(\d(\.\d)?)/);
  if (ratingMatch) filters.min_rating = Number(ratingMatch[1]);

  const departments = ['computer science', 'cs', 'mechanical', 'electrical', 'civil', 'mathematics', 'physics', 'chemistry', 'biology', 'economics', 'business', 'commerce', 'management', 'data science', 'ai', 'artificial intelligence'];
  for (const d of departments) {
    if (q.includes(d)) {
      filters.department = d === 'cs' ? 'computer science' : d;
      break;
    }
  }
  return filters;
}

router.post('/', async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid body' });

  const filters = parseQuestion(parsed.data.question);

  const where: any = {};
  if (filters.department) where.department = { contains: filters.department, mode: 'insensitive' };
  if (filters.level) where.level = filters.level;
  if (filters.delivery_mode) where.delivery_mode = filters.delivery_mode;
  if (filters.max_fee != null) where.tuition_fee_inr = { lte: filters.max_fee };
  if (filters.min_rating != null) where.rating = { gte: filters.min_rating };

  const items = await prisma.course.findMany({ where, take: 20, orderBy: { course_name: 'asc' } });
  res.json({ filters, items, message: items.length ? undefined : 'No matching courses found' });
});

export default router;


