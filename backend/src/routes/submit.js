const express = require('express');
const { z } = require('zod');
const { nanoid } = require('nanoid');
const { read, write } = require('../data/storage');
const { isSupported } = require('../services/languages');
const { runAgainstTests } = require('../services/evaluator');
const config = require('../config');

const router = express.Router();

const DIFFICULTY_BASE = { Easy: 100, Medium: 200, Hard: 400 };

const submitSchema = z.object({
  problemId: z.string().min(1),
  language: z.string().min(1),
  source: z.string().min(1).max(config.limits.maxCodeLength),
  username: z
    .string()
    .min(1)
    .max(40)
    .regex(/^[A-Za-z0-9 _.\-]+$/, 'Username may only contain letters, numbers, space, _ . -'),
});

// Score = base(difficulty) * (passed/total) - clamp(time/limit) bonus.
function computeScore({ difficulty, passed, total, time, timeLimit }) {
  const base = DIFFICULTY_BASE[difficulty] || 100;
  const correctness = total > 0 ? passed / total : 0;
  const speedBonus =
    correctness === 1 && timeLimit > 0
      ? Math.max(0, 1 - Math.min(time, timeLimit) / timeLimit) * 0.25
      : 0;
  return Math.round(base * (correctness + speedBonus));
}

router.post('/', async (req, res, next) => {
  try {
    const parsed = submitSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }
    const { problemId, language, source, username } = parsed.data;

    if (!isSupported(language)) {
      return res.status(400).json({ error: `Unsupported language: ${language}` });
    }

    const problem = read('problems', []).find((p) => p.id === problemId);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    const tests = [...(problem.samples || []), ...(problem.hiddenTests || [])];
    const result = await runAgainstTests({
      language,
      source,
      tests,
      timeLimit: problem.timeLimit,
      memoryLimit: problem.memoryLimit,
    });

    const score = computeScore({
      difficulty: problem.difficulty,
      passed: result.passed,
      total: result.total,
      time: result.time || 0,
      timeLimit: problem.timeLimit || config.limits.defaultTimeLimit,
    });

    const submission = {
      id: nanoid(10),
      username: username.trim(),
      problemId,
      problemTitle: problem.title,
      language,
      verdict: result.verdict,
      passed: result.passed,
      total: result.total,
      time: result.time,
      memory: result.memory,
      score,
      createdAt: new Date().toISOString(),
    };

    const submissions = read('submissions', []);
    submissions.push(submission);
    write('submissions', submissions);

    // Hide hidden test details. Only return summary + sample-test results.
    const sampleCount = problem.samples?.length ?? 0;
    const visibleResults = result.results.slice(0, sampleCount);
    const hiddenSummary = result.results.slice(sampleCount).map((r) => ({
      index: r.index,
      passed: r.passed,
      verdict: r.verdict,
      time: r.time,
      memory: r.memory,
    }));

    res.json({
      submission,
      sampleResults: visibleResults,
      hiddenSummary,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
