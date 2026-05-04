const express = require('express');
const { z } = require('zod');
const { read, write } = require('../data/storage');
const requireAdmin = require('../middleware/admin');

const router = express.Router();
router.use(requireAdmin);

const testSchema = z.object({
  input: z.string(),
  output: z.string(),
  explanation: z.string().optional(),
});

const problemSchema = z.object({
  id: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9-]+$/, 'id must be kebab-case (lowercase, digits, hyphens)'),
  title: z.string().min(1).max(120),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  tags: z.array(z.string().min(1)).default([]),
  description: z.string().min(1),
  inputFormat: z.string().default(''),
  outputFormat: z.string().default(''),
  constraints: z.array(z.string()).default([]),
  timeLimit: z.number().positive().max(15).default(2),
  memoryLimit: z.number().int().positive().max(1024000).default(256000),
  samples: z.array(testSchema).min(1),
  hiddenTests: z.array(testSchema).default([]),
});

router.get('/problems', (req, res) => {
  // Admin gets the full record including hidden tests.
  res.json({ problems: read('problems', []) });
});

router.post('/problems', (req, res) => {
  const parsed = problemSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid problem', details: parsed.error.flatten() });
  }
  const problems = read('problems', []);
  if (problems.find((p) => p.id === parsed.data.id)) {
    return res.status(409).json({ error: 'Problem id already exists' });
  }
  problems.push(parsed.data);
  write('problems', problems);
  res.status(201).json(parsed.data);
});

router.put('/problems/:id', (req, res) => {
  const parsed = problemSchema.safeParse({ ...req.body, id: req.params.id });
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid problem', details: parsed.error.flatten() });
  }
  const problems = read('problems', []);
  const idx = problems.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Problem not found' });
  problems[idx] = parsed.data;
  write('problems', problems);
  res.json(parsed.data);
});

router.delete('/problems/:id', (req, res) => {
  const problems = read('problems', []);
  const next = problems.filter((p) => p.id !== req.params.id);
  if (next.length === problems.length) {
    return res.status(404).json({ error: 'Problem not found' });
  }
  write('problems', next);
  res.json({ ok: true });
});

module.exports = router;
