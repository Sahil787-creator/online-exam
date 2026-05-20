const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  startExam, submitExam, getResult, getMyResults, getExamResults, getLeaderboard,
} = require('../controllers/resultController');

router.use(protect);

router.post('/start', authorize('student'), startExam);
router.get('/my', authorize('student'), getMyResults);
router.post('/:id/submit', authorize('student'), submitExam);
router.get('/exam/:examId', authorize('examiner', 'admin'), getExamResults);
router.get('/exam/:examId/leaderboard', getLeaderboard);
router.get('/:id', getResult);

module.exports = router;
