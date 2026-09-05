const express = require('express');
const db = require('../config/database');
const logger = require('../utils/logger');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/v1/safety/alerts
 * @desc    Get safety alerts for a location
 * @access  Private
 */
router.get('/alerts', authenticate, async (req, res, next) => {
  try {
    const { lat, lng, radius = 5000, limit = 20 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMS',
          message: 'latitude and longitude are required',
        },
      });
    }

    // Query alerts within radius using PostGIS
    const alerts = await db.queryMany(
      `SELECT 
        id, type, severity, title, description, 
        coordinates, radius_meters, created_at, expires_at,
        ST_Distance(coordinates, ST_GeomFromText('POINT($1 $2)', 4326)) as distance_meters
       FROM safety_alerts
       WHERE ST_DWithin(coordinates, ST_GeomFromText('POINT($1 $2)', 4326), $3)
       AND expires_at > NOW()
       ORDER BY distance_meters ASC
       LIMIT $4`,
      [lng, lat, radius, limit],
    );

    return res.json({
      success: true,
      data: alerts,
      meta: {
        total: alerts.length,
        returned: alerts.length,
      },
    });
  } catch (error) {
    logger.error('Get alerts error:', error);
    next(error);
  }
});

/**
 * @route   GET /api/v1/safety/hotspots
 * @desc    Get crime hotspots for a location
 * @access  Private
 */
router.get('/hotspots', authenticate, async (req, res, next) => {
  try {
    const { location, limit = 10 } = req.query;

    if (!location) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMS',
          message: 'location parameter is required',
        },
      });
    }

    const hotspots = await db.queryMany(
      `SELECT * FROM safety_hotspots 
       WHERE location_name ILIKE $1
       ORDER BY risk_score DESC
       LIMIT $2`,
      [`%${location}%`, limit],
    );

    return res.json({
      success: true,
      data: hotspots,
    });
  } catch (error) {
    logger.error('Get hotspots error:', error);
    next(error);
  }
});

/**
 * @route   POST /api/v1/safety/alerts/subscribe
 * @desc    Subscribe to safety alerts for a location
 * @access  Private
 */
router.post('/alerts/subscribe', authenticate, async (req, res, next) => {
  try {
    const { location_id, radius_meters = 5000, alert_types = [], min_severity = 'low' } = req.body;
    const userId = req.user.id;

    // Create subscription
    const subscription = await db.queryOne(
      `INSERT INTO alert_subscriptions (user_id, location_id, radius_meters, alert_types, min_severity, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, status`,
      [userId, location_id, radius_meters, JSON.stringify(alert_types), min_severity],
    );

    logger.info(`Alert subscription created for user ${userId}`);

    return res.status(201).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    logger.error('Subscribe to alerts error:', error);
    next(error);
  }
});

module.exports = router;
