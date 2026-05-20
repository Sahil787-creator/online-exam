const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createExam, getExams, getExam, updateExam, deleteExam,
  togglePublish, getExamForAttempt,
} = require('../controllers/examController');

router.use(protect);

router.route('/')
  .get(getExams)
  .post(authorize('examiner', 'admin'), createExam);

router.route('/:id')
  .get(getExam)
  .put(authorize('examiner', 'admin'), updateExam)
  .delete(authorize('examiner', 'admin'), deleteExam);

router.put('/:id/publish', authorize('examiner', 'admin'), togglePublish);
router.get('/:id/attempt', authorize('student'), getExamForAttempt);

module.exports = router;
