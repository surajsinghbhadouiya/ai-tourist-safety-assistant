const express = require('express');
const db = require('../config/database');
const logger = require('../utils/logger');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/v1/scams
 * @desc    Get scams for a location
 * @access  Private
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { location, limit = 15, category } = req.query;

    if (!location) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMS',
          message: 'location parameter is required',
        },
      });
    }

    let query = 'SELECT * FROM scams WHERE location_name ILIKE $1';
    const params = [`%${location}%`];

    if (category) {
      query += ' AND category = $2';
      params.push(category);
      query += ` LIMIT $${params.length + 1}`;
      params.push(limit);
    } else {
      query += ` LIMIT $${params.length + 1}`;
      params.push(limit);
    }

    const scams = await db.queryMany(query, params);

    return res.json({
      success: true,
      data: scams,
    });
  } catch (error) {
    logger.error('Get scams error:', error);
    next(error);
  }
});

/**
 * @route   POST /api/v1/scams/report
 * @desc    Report a scam
 * @access  Private
 */
router.post('/report', authenticate, async (req, res, next) => {
  try {
    const { title, description, location, category, amount_lost_usd, warning_signs } = req.body;
    const userId = req.user.id;

    if (!title || !description || !location || !category) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMS',
          message: 'title, description, location, and category are required',
        },
      });
    }

    const report = await db.queryOne(
      `INSERT INTO scam_reports 
       (user_id, title, description, location, category, amount_lost_usd, warning_signs, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending_review', NOW())
       RETURNING id, status`,
      [userId, title, description, JSON.stringify(location), category, amount_lost_usd || null, JSON.stringify(warning_signs || [])],
    );

    logger.info(`Scam report created by user ${userId}`);

    return res.status(201).json({
      success: true,
      data: {
        report_id: report.id,
        status: report.status,
      },
    });
  } catch (error) {
    logger.error('Report scam error:', error);
    next(error);
  }
});

module.exports = router;
