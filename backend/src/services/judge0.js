const axios = require('axios');
const config = require('../config');
const { getJudge0Id } = require('./languages');

// Judge0 status IDs we care about.
//   1, 2  = In Queue / Processing
//   3     = Accepted
//   4     = Wrong Answer
//   5     = Time Limit Exceeded
//   6     = Compilation Error
//   7-12  = Runtime errors (SIGSEGV, SIGXFSZ, SIGFPE, SIGABRT, NZEC, Other)
//   13    = Internal Error
//   14    = Exec Format Error

function buildHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (config.execution.rapidApiKey) {
    headers['X-RapidAPI-Key'] = config.execution.rapidApiKey;
    headers['X-RapidAPI-Host'] = config.execution.rapidApiHost;
  }
  return headers;
}

function b64encode(str) {
  return Buffer.from(str ?? '', 'utf-8').toString('base64');
}

function b64decode(str) {
  if (!str) return '';
  return Buffer.from(str, 'base64').toString('utf-8');
}

function statusToVerdict(statusId) {
  switch (statusId) {
    case 3:
      return 'Accepted';
    case 4:
      return 'Wrong Answer';
    case 5:
      return 'Time Limit Exceeded';
    case 6:
      return 'Compilation Error';
    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
    case 12:
      return 'Runtime Error';
    case 13:
      return 'Internal Error';
    case 14:
      return 'Exec Format Error';
    default:
      return 'Unknown';
  }
}

async function executeOne({ language, source, stdin, timeLimit, memoryLimit }) {
  const language_id = getJudge0Id(language);
  if (!language_id) throw new Error(`Unsupported language: ${language}`);

  const url = `${config.execution.judge0Url}/submissions?base64_encoded=true&wait=true`;
  const payload = {
    language_id,
    source_code: b64encode(source),
    stdin: b64encode(stdin || ''),
    cpu_time_limit: timeLimit ?? config.limits.defaultTimeLimit,
    memory_limit: memoryLimit ?? config.limits.defaultMemoryLimit,
    redirect_stderr_to_stdout: false,
  };

  const { data } = await axios.post(url, payload, {
    headers: buildHeaders(),
    timeout: 30000,
  });

  return {
    statusId: data.status?.id,
    verdict: statusToVerdict(data.status?.id),
    stdout: b64decode(data.stdout),
    stderr: b64decode(data.stderr),
    compileOutput: b64decode(data.compile_output),
    message: b64decode(data.message),
    time: data.time ? parseFloat(data.time) : null,
    memory: data.memory ?? null,
  };
}

module.exports = { executeOne };
