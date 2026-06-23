const express = require('express');
const { getLostFoundItems, createLostFoundItem, updateLostFoundItem, deleteLostFoundItem, adminDeleteLostFoundItem, updateItemStatus } = require('../controllers/lostFoundController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getLostFoundItems);
router.post('/', protect, createLostFoundItem);

// Admin-only: delete any item regardless of ownership
router.delete('/admin/:id', protect, adminOnly, adminDeleteLostFoundItem);

// Status update — using PUT on a dedicated sub-route to avoid Express 5 PATCH issues
router.put('/status/:id', protect, updateItemStatus);

router.put('/:id', protect, updateLostFoundItem);
router.delete('/:id', protect, deleteLostFoundItem);

module.exports = router;
