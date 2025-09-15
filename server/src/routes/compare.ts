import { Router } from 'express';
import { prisma } from '../shared/prisma.js';
import { z } from 'zod';

const router = Router();

router.get('/', async (req, res) => {
  const schema = z.object({ ids: z.string() });
  const parsed = schema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'ids query param required, e.g. ids=1,2,3' });
  }
  const ids = parsed.data.ids
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const items = await prisma.course.findMany({ where: { course_id: { in: ids } } });
  res.json({ items });
});

export default router;


