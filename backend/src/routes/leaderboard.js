const express = require('express');
const { read } = require('../data/storage');

const router = express.Router();

// Aggregate per (username): sum of best score per problem, total accepted,
// average time across accepted submissions. Returns top N.
router.get('/', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
  const subs = read('submissions', []);

  const byUser = new Map();
  for (const s of subs) {
    const user = byUser.get(s.username) || {
      username: s.username,
      score: 0,
      accepted: 0,
      submissions: 0,
      totalTime: 0,
      bestPerProblem: new Map(),
    };
    user.submissions += 1;
    if (s.verdict === 'Accepted') {
      user.accepted += 1;
      user.totalTime += s.time || 0;
    }
    const prevBest = user.bestPerProblem.get(s.problemId) || 0;
    if (s.score > prevBest) user.bestPerProblem.set(s.problemId, s.score);
    byUser.set(s.username, user);
  }

  const rows = Array.from(byUser.values()).map((u) => {
    const score = Array.from(u.bestPerProblem.values()).reduce((a, b) => a + b, 0);
    const avgTime = u.accepted > 0 ? u.totalTime / u.accepted : 0;
    return {
      username: u.username,
      score,
      problemsSolved: u.bestPerProblem.size,
      submissions: u.submissions,
      accepted: u.accepted,
      avgTime: Number(avgTime.toFixed(3)),
    };
  });

  rows.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.problemsSolved !== a.problemsSolved) return b.problemsSolved - a.problemsSolved;
    return a.avgTime - b.avgTime;
  });

  res.json({ leaderboard: rows.slice(0, limit) });
});

module.exports = router;
