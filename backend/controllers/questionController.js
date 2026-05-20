const Question = require('../models/Question');
const Exam = require('../models/Exam');

// @desc    Add question to exam
// @route   POST /api/questions
exports.addQuestion = async (req, res) => {
  try {
    const { examId, questionText, type, options, correctAnswer, marks, difficulty, explanation } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    if (exam.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const question = await Question.create({
      exam: examId,
      questionText,
      type: type || 'mcq',
      options: options || [],
      correctAnswer,
      marks: marks || 1,
      difficulty: difficulty || 'medium',
      explanation: explanation || '',
      order: (await Question.countDocuments({ exam: examId })),
    });

    // Add question reference to exam
    exam.questions.push(question._id);
    // Update total marks
    exam.totalMarks = (exam.totalMarks || 0) + question.marks;
    exam.passingMarks = Math.ceil(exam.totalMarks * 0.4);
    await exam.save();

    res.status(201).json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get questions for an exam
// @route   GET /api/questions/exam/:examId
exports.getQuestions = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    if (exam.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const questions = await Question.find({ exam: req.params.examId }).sort('order');
    res.json({ success: true, count: questions.length, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update question
// @route   PUT /api/questions/:id
exports.updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

    const exam = await Exam.findById(question.exam);
    if (exam.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const oldMarks = question.marks;
    const updated = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (req.body.marks && req.body.marks !== oldMarks) {
      exam.totalMarks = exam.totalMarks - oldMarks + updated.marks;
      exam.passingMarks = Math.ceil(exam.totalMarks * 0.4);
      await exam.save();
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

    const exam = await Exam.findById(question.exam);
    if (exam.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    exam.questions = exam.questions.filter(q => q.toString() !== req.params.id);
    exam.totalMarks = Math.max(0, exam.totalMarks - question.marks);
    exam.passingMarks = Math.ceil(exam.totalMarks * 0.4);
    await exam.save();

    await question.deleteOne();
    res.json({ success: true, message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk add questions
// @route   POST /api/questions/bulk
exports.bulkAddQuestions = async (req, res) => {
  try {
    const { examId, questions } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    if (exam.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const startOrder = await Question.countDocuments({ exam: examId });
    const questionsToInsert = questions.map((q, i) => ({ ...q, exam: examId, order: startOrder + i }));
    const created = await Question.insertMany(questionsToInsert);

    const ids = created.map(q => q._id);
    const totalNewMarks = created.reduce((sum, q) => sum + q.marks, 0);

    exam.questions.push(...ids);
    exam.totalMarks = (exam.totalMarks || 0) + totalNewMarks;
    exam.passingMarks = Math.ceil(exam.totalMarks * 0.4);
    await exam.save();

    res.status(201).json({ success: true, count: created.length, data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
