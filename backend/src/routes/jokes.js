const express = require('express');
const axios = require('axios');
const logger = require('../utils/logger');
const { authenticate, authenticateOptional } = require('../middleware/auth');
const redis = require('../config/redis');

const router = express.Router();

const JOKES_API_URL = 'https://official-joke-api.appspot.com';

/**
 * @route   GET /api/v1/jokes/random
 * @desc    Get a random joke
 * @access  Public
 */
router.get('/random', authenticateOptional, async (req, res, next) => {
  try {
    const cacheKey = 'joke:random:latest';
    
    // Check cache first
    const cachedJoke = await redis.get(cacheKey);
    if (cachedJoke) {
      return res.json({
        success: true,
        data: cachedJoke,
        source: 'cache',
      });
    }

    try {
      const response = await axios.get(`${JOKES_API_URL}/random_joke`, {
        timeout: 5000,
      });

      const joke = {
        id: response.data.id,
        type: response.data.type,
        setup: response.data.setup,
        punchline: response.data.punchline,
        full_joke: `${response.data.setup}\n${response.data.punchline}`,
      };

      // Cache for 1 hour
      await redis.set(cacheKey, joke, 3600);

      logger.info(`Random joke fetched - ID: ${joke.id}`);

      return res.json({
        success: true,
        data: joke,
        source: 'api',
      });
    } catch (apiError) {
      logger.error('Jokes API error:', apiError.message);
      
      // Return offline joke if API fails
      const offlineJoke = {
        id: 'offline',
        type: 'general',
        setup: 'Why did the tourist bring a ladder to the vacation?',
        punchline: 'Because they wanted to take their travel experience to the next level!',
        full_joke: 'Why did the tourist bring a ladder to the vacation?\nBecause they wanted to take their travel experience to the next level!',
        offline: true,
      };

      return res.json({
        success: true,
        data: offlineJoke,
        source: 'offline',
      });
    }
  } catch (error) {
    logger.error('Get random joke error:', error);
    next(error);
  }
});

/**
 * @route   GET /api/v1/jokes/by-type/:type
 * @desc    Get joke by type (general, knock-knock, programming)
 * @access  Public
 */
router.get('/by-type/:type', authenticateOptional, async (req, res, next) => {
  try {
    const { type } = req.params;
    const validTypes = ['general', 'knock-knock', 'programming'];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TYPE',
          message: `Invalid joke type. Valid types: ${validTypes.join(', ')}`,
        },
      });
    }

    const cacheKey = `joke:type:${type}`;
    
    // Check cache
    const cachedJoke = await redis.get(cacheKey);
    if (cachedJoke) {
      return res.json({
        success: true,
        data: cachedJoke,
        source: 'cache',
      });
    }

    try {
      const response = await axios.get(
        `${JOKES_API_URL}/jokes/${type}/random`,
        { timeout: 5000 }
      );

      const jokeData = Array.isArray(response.data) ? response.data[0] : response.data;

      const joke = {
        id: jokeData.id,
        type: jokeData.type,
        setup: jokeData.setup,
        punchline: jokeData.punchline,
        full_joke: `${jokeData.setup}\n${jokeData.punchline}`,
      };

      // Cache for 1 hour
      await redis.set(cacheKey, joke, 3600);

      logger.info(`Joke by type '${type}' fetched - ID: ${joke.id}`);

      return res.json({
        success: true,
        data: joke,
        source: 'api',
      });
    } catch (apiError) {
      logger.error(`Jokes API error for type ${type}:`, apiError.message);

      const fallbackJokes = {
        'general': {
          id: 'fallback-1',
          type: 'general',
          setup: 'Why don\'t scientists trust atoms?',
          punchline: 'Because they make up everything!',
        },
        'knock-knock': {
          id: 'fallback-2',
          type: 'knock-knock',
          setup: 'Knock knock',
          punchline: 'Who\'s there? Travel. Travel who? Travel the world with our app!',
        },
        'programming': {
          id: 'fallback-3',
          type: 'programming',
          setup: 'Why do Java developers wear glasses?',
          punchline: 'Because they don\'t C#',
        },
      };

      const fallback = fallbackJokes[type];
      fallback.full_joke = `${fallback.setup}\n${fallback.punchline}`;
      fallback.offline = true;

      return res.json({
        success: true,
        data: fallback,
        source: 'offline',
      });
    }
  } catch (error) {
    logger.error('Get joke by type error:', error);
    next(error);
  }
});

/**
 * @route   GET /api/v1/jokes/multiple
 * @desc    Get multiple random jokes
 * @access  Public
 */
router.get('/multiple', authenticateOptional, async (req, res, next) => {
  try {
    const { count = 5 } = req.query;
    const numJokes = Math.min(Math.max(parseInt(count), 1), 10); // Limit between 1-10

    const cacheKey = `jokes:multiple:${numJokes}`;
    
    // Check cache
    const cachedJokes = await redis.get(cacheKey);
    if (cachedJokes) {
      return res.json({
        success: true,
        data: cachedJokes,
        source: 'cache',
      });
    }

    try {
      const response = await axios.get(
        `${JOKES_API_URL}/jokes/random/${numJokes}`,
        { timeout: 5000 }
      );

      const jokes = response.data.map(j => ({
        id: j.id,
        type: j.type,
        setup: j.setup,
        punchline: j.punchline,
        full_joke: `${j.setup}\n${j.punchline}`,
      }));

      // Cache for 1 hour
      await redis.set(cacheKey, jokes, 3600);

      logger.info(`${numJokes} random jokes fetched`);

      return res.json({
        success: true,
        data: jokes,
        meta: {
          total: jokes.length,
          source: 'api',
        },
      });
    } catch (apiError) {
      logger.error('Jokes API error:', apiError.message);

      const offlineJokes = [
        {
          id: 'offline-1',
          type: 'general',
          setup: 'Why did the tourist get lost?',
          punchline: 'Because Google Maps said "turn left" but they turned right!',
        },
        {
          id: 'offline-2',
          type: 'general',
          setup: 'What do you call a tour guide?',
          punchline: 'Someone who knows all the way around!',
        },
        {
          id: 'offline-3',
          type: 'general',
          setup: 'Why do tourists always carry a map?',
          punchline: 'Because they want to stay on the right path!',
        },
      ];

      offlineJokes.forEach(j => {
        j.full_joke = `${j.setup}\n${j.punchline}`;
        j.offline = true;
      });

      return res.json({
        success: true,
        data: offlineJokes.slice(0, numJokes),
        meta: {
          total: Math.min(numJokes, offlineJokes.length),
          source: 'offline',
        },
      });
    }
  } catch (error) {
    logger.error('Get multiple jokes error:', error);
    next(error);
  }
});

/**
 * @route   GET /api/v1/jokes/types
 * @desc    Get available joke types
 * @access  Public
 */
router.get('/types', authenticateOptional, async (req, res, next) => {
  try {
    const types = [
      {
        id: 'general',
        name: 'General',
        description: 'General jokes about anything',
      },
      {
        id: 'knock-knock',
        name: 'Knock Knock',
        description: 'Classic knock-knock jokes',
      },
      {
        id: 'programming',
        name: 'Programming',
        description: 'Jokes for developers and tech enthusiasts',
      },
    ];

    return res.json({
      success: true,
      data: types,
    });
  } catch (error) {
    logger.error('Get joke types error:', error);
    next(error);
  }
});

module.exports = router;
