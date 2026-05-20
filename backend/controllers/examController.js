const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Result = require('../models/Result');

// @desc    Create exam
// @route   POST /api/exams
exports.createExam = async (req, res) => {
  try {
    const exam = await Exam.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: exam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all published exams (students)
// @route   GET /api/exams
exports.getExams = async (req, res) => {
  try {
    const { status, subject, category, search } = req.query;
    let query = {};

    if (req.user.role === 'student') {
      query.status = 'published';
    } else if (req.user.role === 'examiner') {
      query.createdBy = req.user._id;
    }

    if (status && req.user.role !== 'student') query.status = status;
    if (subject) query.subject = { $regex: subject, $options: 'i' };
    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };

    const exams = await Exam.find(query)
      .populate('createdBy', 'name email')
      .populate('questions', 'marks')
      .sort('-createdAt');

    res.json({ success: true, count: exams.length, data: exams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single exam
// @route   GET /api/exams/:id
exports.getExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('questions');

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    // Students only see published exams
    if (req.user.role === 'student' && exam.status !== 'published') {
      return res.status(403).json({ success: false, message: 'Exam not available' });
    }

    res.json({ success: true, data: exam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update exam
// @route   PUT /api/exams/:id
exports.updateExam = async (req, res) => {
  try {
    let exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    if (exam.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: exam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete exam
// @route   DELETE /api/exams/:id
exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    if (exam.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Question.deleteMany({ exam: req.params.id });
    await exam.deleteOne();
    res.json({ success: true, message: 'Exam deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Publish / unpublish exam
// @route   PUT /api/exams/:id/publish
exports.togglePublish = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('questions');
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    if (exam.questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Cannot publish exam without questions' });
    }

    if (req.user.role === 'examiner') {
      exam.status = exam.status === 'draft' ? 'pending_approval' : 'draft';
    } else if (req.user.role === 'admin') {
      exam.status = exam.status === 'published' ? 'draft' : 'published';
    }

    // Recalculate total marks
    const totalMarks = exam.questions.reduce((sum, q) => sum + q.marks, 0);
    exam.totalMarks = totalMarks;
    exam.passingMarks = Math.ceil(totalMarks * 0.4);

    await exam.save();
    res.json({ success: true, data: exam, message: `Exam status: ${exam.status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get exam for attempt (no answers)
// @route   GET /api/exams/:id/attempt
exports.getExamForAttempt = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    if (exam.status !== 'published') return res.status(403).json({ success: false, message: 'Exam is not available' });

    // Check if already attempted
    if (!exam.allowMultipleAttempts) {
      const existingResult = await Result.findOne({
        user: req.user._id,
        exam: exam._id,
        status: { $in: ['submitted', 'auto_submitted'] },
      });
      if (existingResult) {
        return res.status(400).json({ success: false, message: 'You have already attempted this exam', resultId: existingResult._id });
      }
    }

    const questions = await Question.find({ exam: exam._id })
      .select('-correctAnswer -explanation')
      .sort('order');

    const shuffled = exam.shuffleQuestions ? questions.sort(() => Math.random() - 0.5) : questions;

    res.json({
      success: true,
      data: {
        _id: exam._id,
        title: exam.title,
        description: exam.description,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        instructions: exam.instructions,
        questions: shuffled,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
