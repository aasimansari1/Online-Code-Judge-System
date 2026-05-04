const express = require('express');
const { LANGUAGES } = require('../services/languages');
const config = require('../config');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    ok: true,
    engine: config.execution.engine,
    time: new Date().toISOString(),
  });
});

router.get('/languages', (req, res) => {
  res.json({
    languages: Object.entries(LANGUAGES).map(([key, val]) => ({
      key,
      label: val.label,
      mode: val.mode,
    })),
  });
});

module.exports = router;
