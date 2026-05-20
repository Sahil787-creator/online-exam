const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  addQuestion, getQuestions, updateQuestion, deleteQuestion, bulkAddQuestions,
} = require('../controllers/questionController');

router.use(protect);

router.post('/', authorize('examiner', 'admin'), addQuestion);
router.post('/bulk', authorize('examiner', 'admin'), bulkAddQuestions);
router.get('/exam/:examId', authorize('examiner', 'admin'), getQuestions);
router.put('/:id', authorize('examiner', 'admin'), updateQuestion);
router.delete('/:id', authorize('examiner', 'admin'), deleteQuestion);

module.exports = router;
