const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

const speedLimiter = slowDown({
  windowMs: 30 * 1000, // 30 secs
  delayAfter: 1, // allow 1 requests per 30 secs, then...
  delayMs: 500 // begin adding 500ms of delay per request above 100:
  // request # 101 is delayed by  500ms
  // request # 102 is delayed by 1000ms
  // request # 103 is delayed by 1500ms
  // etc.
});

const limiter = rateLimit({
  windowMs: 30 * 1000, // 30 secs
  max: 10 // limit each IP to 10 requests per windowMs
});
const router = express.Router();

const BASE_URL = 'https://api.nasa.gov/insight_weather/?';

let cachedData;
let cacheTime;

const apiKeys = new Map();
apiKeys.set('1234', true);

router.get('/', limiter, speedLimiter, (req, res, next) => {
  const apiKey = req.get('X-API-KEY');
  if (apiKeys.has(apiKey)) {
    next();
  } else {
    const error = new Error('Invalid API Key');
    next(error);
  }
}, async (req, res, next) => {
  if (cacheTime && cacheTime > Date.now() - 30 * 1000) {
    return res.json(cachedData);
  }
  try {
    const params = new URLSearchParams({
      api_key: process.env.NASA_API_KEY,
      feedtype: 'json',
      ver: '1.0',
    });
    // 1. make a NASA api call
    // console.log(`${BASE_URL}${params}`);
    const { data } = await axios.get(`${BASE_URL}${params}`);
    cachedData = data;
    cacheTime = Date.now();
    data.cacheTime = cacheTime;
    // 2. response to request with the data from NASA api
    return res.json(data);
    // res.json({
    //   message: "Hello this is mars aa weather",
    // });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
