const { runCode } = require('./executor');

function normalize(s) {
  if (s == null) return '';
  // Trim trailing whitespace per line and collapse trailing blank lines —
  // this matches typical judge behavior (forgiving of trailing newlines/spaces).
  return s
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/\s+$/g, ''))
    .join('\n')
    .replace(/\n+$/, '');
}

function compare(actual, expected) {
  return normalize(actual) === normalize(expected);
}

async function runAgainstTests({ language, source, tests, timeLimit, memoryLimit }) {
  const results = [];
  let passed = 0;
  let totalTime = 0;
  let maxMemory = 0;
  let firstFailure = null;

  for (let i = 0; i < tests.length; i += 1) {
    const t = tests[i];
    let exec;
    try {
      exec = await runCode({
        language,
        source,
        stdin: t.input,
        timeLimit,
        memoryLimit,
      });
    } catch (err) {
      results.push({
        index: i,
        verdict: 'Internal Error',
        stderr: err.message,
        passed: false,
      });
      firstFailure = firstFailure ?? i;
      continue;
    }

    const matched = exec.verdict === 'Accepted' && compare(exec.stdout, t.output);
    let verdict = exec.verdict;
    if (verdict === 'Accepted' && !matched) verdict = 'Wrong Answer';
    if (matched) passed += 1;

    if (exec.time != null) totalTime += exec.time;
    if (exec.memory != null && exec.memory > maxMemory) maxMemory = exec.memory;

    results.push({
      index: i,
      verdict,
      passed: matched,
      time: exec.time,
      memory: exec.memory,
      stdout: exec.stdout,
      stderr: exec.stderr,
      compileOutput: exec.compileOutput,
      // Only echo expected/actual on failure for sample (visible) tests; the
      // route layer decides whether to expose hidden test details.
      expected: t.output,
      input: t.input,
    });

    if (!matched && firstFailure == null) firstFailure = i;
    // If compilation failed, stop early — every test will fail the same way.
    if (verdict === 'Compilation Error') break;
  }

  let overall = 'Accepted';
  if (passed < tests.length) {
    overall = results[firstFailure ?? 0]?.verdict || 'Wrong Answer';
  }

  return {
    verdict: overall,
    passed,
    total: tests.length,
    time: Number(totalTime.toFixed(3)),
    memory: maxMemory,
    results,
  };
}

module.exports = { runAgainstTests, normalize, compare };
