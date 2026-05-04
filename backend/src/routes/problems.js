const express = require('express');
const { read } = require('../data/storage');

const router = express.Router();

// Hide hidden tests from public listings.
function publicProblem(p) {
  if (!p) return p;
  const { hiddenTests, ...rest } = p;
  return { ...rest, hiddenTestCount: hiddenTests?.length ?? 0 };
}

router.get('/', (req, res) => {
  const { difficulty, tag, q } = req.query;
  let problems = read('problems', []);

  if (difficulty) {
    const d = String(difficulty).toLowerCase();
    problems = problems.filter((p) => p.difficulty.toLowerCase() === d);
  }
  if (tag) {
    const t = String(tag).toLowerCase();
    problems = problems.filter((p) => (p.tags || []).some((x) => x.toLowerCase() === t));
  }
  if (q) {
    const needle = String(q).toLowerCase();
    problems = problems.filter((p) => p.title.toLowerCase().includes(needle));
  }

  const allTags = new Set();
  read('problems', []).forEach((p) => (p.tags || []).forEach((t) => allTags.add(t)));

  res.json({
    problems: problems.map((p) => ({
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      tags: p.tags,
    })),
    tags: Array.from(allTags).sort(),
  });
});

router.get('/:id', (req, res) => {
  const problems = read('problems', []);
  const p = problems.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Problem not found' });
  res.json(publicProblem(p));
});

module.exports = router;
