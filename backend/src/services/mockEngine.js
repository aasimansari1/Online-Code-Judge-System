// Dev fallback: returns a deterministic "ran but didn't actually compile"
// response so the UI works end-to-end without a real execution backend.
// Always switch EXECUTION_ENGINE=judge0 in real environments.

async function executeOne({ stdin }) {
  return {
    statusId: 0,
    verdict: 'Mock',
    stdout: '',
    stderr:
      'Mock execution engine is enabled. Configure JUDGE0_URL + JUDGE0_RAPIDAPI_KEY ' +
      'and set EXECUTION_ENGINE=judge0 in backend/.env to actually run code.',
    compileOutput: '',
    message: 'mock',
    time: 0,
    memory: 0,
    echoedStdin: stdin,
  };
}

module.exports = { executeOne };
