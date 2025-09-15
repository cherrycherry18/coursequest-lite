import { Router } from 'express';
import { prisma } from '../shared/prisma.js';
import { z } from 'zod';

const router = Router();

const querySchema = z.object({
  search: z.string().optional(),
  department: z.string().optional(),
  level: z.enum(['UG', 'PG']).optional(),
  delivery_mode: z.enum(['online', 'offline', 'hybrid']).optional(),
  min_credits: z.coerce.number().int().min(0).optional(),
  max_credits: z.coerce.number().int().min(0).optional(),
  max_fee: z.coerce.number().min(0).optional(),
  min_rating: z.coerce.number().min(0).max(5).optional(),
  year_offered: z.coerce.number().int().optional(),
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(10),
});

router.get('/', async (req, res) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid query', details: parsed.error.flatten() });
  }
  const {
    search,
    department,
    level,
    delivery_mode,
    min_credits,
    max_credits,
    max_fee,
    min_rating,
    year_offered,
    page,
    page_size,
  } = parsed.data;

  const where: any = {};
  if (search) {
    where.OR = [
      { course_name: { contains: search, mode: 'insensitive' } },
      { department: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (department) where.department = { equals: department, mode: 'insensitive' };
  if (level) where.level = level;
  if (delivery_mode) where.delivery_mode = delivery_mode;
  if (min_credits != null || max_credits != null) {
    where.credits = {};
    if (min_credits != null) where.credits.gte = min_credits;
    if (max_credits != null) where.credits.lte = max_credits;
  }
  if (max_fee != null) where.tuition_fee_inr = { lte: max_fee };
  if (min_rating != null) where.rating = { gte: min_rating };
  if (year_offered != null) where.year_offered = year_offered;

  const skip = (page - 1) * page_size;
  const [items, total] = await Promise.all([
    prisma.course.findMany({ where, skip, take: page_size, orderBy: { course_name: 'asc' } }),
    prisma.course.count({ where }),
  ]);

  res.json({ items, total, page, page_size });
});

export default router;


