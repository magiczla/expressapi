const express = require('express');

const emojis = require('./emojis');
const marsweather = require('./marsweather');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏'
  });
});

router.use('/emojis', emojis);
router.use('/marsweather', marsweather);

module.exports = router;
