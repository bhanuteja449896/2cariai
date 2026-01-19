const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes are protected
router.use(auth);

// Report routes
router.post('/', upload.single('file'), reportController.uploadReport);
router.get('/', reportController.getReports);
router.get('/shared', reportController.getSharedReports);
router.get('/:id', reportController.getReport);
router.get('/:id/download', reportController.downloadReport);
router.delete('/:id', reportController.deleteReport);

// Sharing routes
router.post('/:id/share', reportController.shareReport);
router.delete('/shared/:id', reportController.revokeAccess);

module.exports = router;
