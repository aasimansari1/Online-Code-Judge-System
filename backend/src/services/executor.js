const config = require('../config');
const judge0 = require('./judge0');
const mock = require('./mockEngine');

function pickEngine() {
  if (config.execution.engine === 'mock') return mock;
  return judge0;
}

async function runCode(opts) {
  const engine = pickEngine();
  return engine.executeOne(opts);
}

module.exports = { runCode };
