const express = require('express');
const logger = require('../utils/logger');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/v1/emergency
 * @desc    Get emergency contacts for a location
 * @access  Private
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { location, services } = req.query;

    if (!location) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMS',
          message: 'location parameter is required',
        },
      });
    }

    // Placeholder implementation
    const emergencyData = {
      country: 'Country',
      location: location,
      emergency_numbers: {},
      services: [],
    };

    return res.json({
      success: true,
      data: emergencyData,
    });
  } catch (error) {
    logger.error('Get emergency contacts error:', error);
    next(error);
  }
});

/**
 * @route   POST /api/v1/emergency/sos
 * @desc    Send SOS alert
 * @access  Private
 */
router.post('/sos', authenticate, async (req, res, next) => {
  try {
    const { situation, location, share_with = [] } = req.body;
    const userId = req.user.id;

    if (!situation || !location) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMS',
          message: 'situation and location are required',
        },
      });
    }

    logger.warn(`SOS alert from user ${userId}: ${situation}`);

    const sos = {
      sos_id: 'generated-id',
      status: 'active',
      emergency_services_contacted: true,
      trusted_contacts_notified: 0,
    };

    return res.status(201).json({
      success: true,
      data: sos,
    });
  } catch (error) {
    logger.error('SOS alert error:', error);
    next(error);
  }
});

module.exports = router;
