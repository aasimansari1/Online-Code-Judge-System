const express = require('express');
const { z } = require('zod');
const { read } = require('../data/storage');
const { isSupported } = require('../services/languages');
const { runAgainstTests } = require('../services/evaluator');
const config = require('../config');

const router = express.Router();

const runSchema = z.object({
  problemId: z.string().min(1),
  language: z.string().min(1),
  source: z.string().min(1).max(config.limits.maxCodeLength),
  customInput: z.string().optional(),
});

router.post('/', async (req, res, next) => {
  try {
    const parsed = runSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }
    const { problemId, language, source, customInput } = parsed.data;

    if (!isSupported(language)) {
      return res.status(400).json({ error: `Unsupported language: ${language}` });
    }

    const problem = read('problems', []).find((p) => p.id === problemId);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    const tests = customInput != null
      ? [{ input: customInput, output: '' }]
      : problem.samples;

    const result = await runAgainstTests({
      language,
      source,
      tests,
      timeLimit: problem.timeLimit,
      memoryLimit: problem.memoryLimit,
    });

    // For "run", return per-test details — these are sample tests so it's safe.
    res.json({
      mode: customInput != null ? 'custom' : 'samples',
      ...result,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
