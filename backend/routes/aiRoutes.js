const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { generateQuestions, generateFeedback, assessDifficulty } = require('../controllers/aiController');

router.use(protect);

router.post('/generate-questions', authorize('examiner', 'admin'), generateQuestions);
router.post('/feedback', generateFeedback);
router.post('/difficulty', authorize('examiner', 'admin'), assessDifficulty);

module.exports = router;
