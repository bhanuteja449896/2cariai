const express = require('express');
const router = express.Router();
const vitalsController = require('../controllers/vitalsController');
const auth = require('../middleware/auth');

// All routes are protected
router.use(auth);

// Vitals routes
router.get('/', vitalsController.getVitals);
router.get('/summary', vitalsController.getVitalsSummary);
router.get('/types', vitalsController.getVitalTypes);
router.get('/trends', vitalsController.getVitalsTrends);

module.exports = router;
