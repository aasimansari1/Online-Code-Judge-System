const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const { read, write } = require('./data/storage');
const { PROBLEMS } = require('./data/seed');

// Auto-seed on first boot so the app works with zero setup.
if (read('problems', []).length === 0) {
  write('problems', PROBLEMS);
  console.log(`[seed] wrote ${PROBLEMS.length} starter problems`);
}
if (!read('submissions', null)) write('submissions', []);

const app = express();

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '256kb' }));
app.use(
  cors({
    origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(',').map((s) => s.trim()),
    credentials: false,
  }),
);
app.use(morgan(config.env === 'development' ? 'dev' : 'tiny'));

// Rate limit run/submit endpoints to deter abuse.
const judgeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});

app.use('/', require('./routes/meta'));
app.use('/problems', require('./routes/problems'));
app.use('/run', judgeLimiter, require('./routes/run'));
app.use('/submit', judgeLimiter, require('./routes/submit'));
app.use('/leaderboard', require('./routes/leaderboard'));
app.use('/admin', require('./routes/admin'));

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[error]', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.publicMessage || 'Internal server error',
    ...(config.env === 'development' ? { detail: err.message } : {}),
  });
});

app.listen(config.port, () => {
  console.log(`Code Judge backend listening on :${config.port} (engine: ${config.execution.engine})`);
});
