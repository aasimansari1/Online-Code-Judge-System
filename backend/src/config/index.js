require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 4000,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  adminToken: process.env.ADMIN_TOKEN || 'change-me-to-a-long-random-string',

  execution: {
    engine: process.env.EXECUTION_ENGINE || 'judge0',
    judge0Url: (process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com').replace(/\/$/, ''),
    rapidApiKey: process.env.JUDGE0_RAPIDAPI_KEY || '',
    rapidApiHost: process.env.JUDGE0_RAPIDAPI_HOST || 'judge0-ce.p.rapidapi.com',
  },

  limits: {
    maxCodeLength: parseInt(process.env.MAX_CODE_LENGTH, 10) || 65536,
    defaultTimeLimit: parseFloat(process.env.DEFAULT_TIME_LIMIT) || 2,
    defaultMemoryLimit: parseInt(process.env.DEFAULT_MEMORY_LIMIT, 10) || 256000,
  },
};

module.exports = config;
