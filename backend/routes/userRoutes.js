const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { updateProfile, getProfile } = require('../controllers/userController');

router.use(protect);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router;
