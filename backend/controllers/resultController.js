const Result = require('../models/Result');
const Exam = require('../models/Exam');
const Question = require('../models/Question');

// @desc    Start exam attempt
// @route   POST /api/results/start
exports.startExam = async (req, res) => {
  try {
    const { examId } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    if (exam.status !== 'published') return res.status(400).json({ success: false, message: 'Exam not available' });

    // Check existing in-progress attempt
    const inProgress = await Result.findOne({ user: req.user._id, exam: examId, status: 'in_progress' });
    if (inProgress) {
      return res.json({ success: true, data: inProgress, message: 'Resuming existing attempt' });
    }

    // Check already submitted
    if (!exam.allowMultipleAttempts) {
      const submitted = await Result.findOne({ user: req.user._id, exam: examId, status: { $in: ['submitted', 'auto_submitted'] } });
      if (submitted) return res.status(400).json({ success: false, message: 'Already attempted this exam' });
    }

    const result = await Result.create({
      user: req.user._id,
      exam: examId,
      startedAt: new Date(),
      totalMarks: exam.totalMarks,
      status: 'in_progress',
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit exam
// @route   POST /api/results/:id/submit
exports.submitExam = async (req, res) => {
  try {
    const { answers, timeTaken, autoSubmit } = req.body;

    const result = await Result.findById(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: 'Result not found' });

    if (result.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (result.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Exam already submitted' });
    }

    const exam = await Exam.findById(result.exam);
    const questions = await Question.find({ exam: result.exam });

    let score = 0;
    const processedAnswers = questions.map(question => {
      const studentAnswer = answers?.find(a => a.questionId === question._id.toString());
      const selectedAnswer = studentAnswer?.selectedAnswer || '';
      const isCorrect = question.type !== 'short_answer'
        ? selectedAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()
        : false;
      const marksObtained = isCorrect ? question.marks : 0;
      score += marksObtained;

      return {
        question: question._id,
        selectedAnswer,
        isCorrect,
        marksObtained,
        isMarkedForReview: studentAnswer?.isMarkedForReview || false,
        timeSpent: studentAnswer?.timeSpent || 0,
      };
    });

    const totalMarks = exam.totalMarks;
    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const isPassed = score >= exam.passingMarks;

    result.answers = processedAnswers;
    result.score = score;
    result.totalMarks = totalMarks;
    result.percentage = percentage;
    result.isPassed = isPassed;
    result.timeTaken = timeTaken || 0;
    result.submittedAt = new Date();
    result.status = autoSubmit ? 'auto_submitted' : 'submitted';

    await result.save();

    // Calculate rank
    const allResults = await Result.find({ exam: result.exam, status: { $in: ['submitted', 'auto_submitted'] } }).sort('-score');
    const rank = allResults.findIndex(r => r._id.toString() === result._id.toString()) + 1;
    result.rank = rank;
    await result.save();

    res.json({
      success: true,
      data: {
        resultId: result._id,
        score,
        totalMarks,
        percentage,
        isPassed,
        rank,
        timeTaken: result.timeTaken,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get result details
// @route   GET /api/results/:id
exports.getResult = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('user', 'name email')
      .populate('exam', 'title subject totalMarks passingMarks duration')
      .populate('answers.question', 'questionText options correctAnswer marks type explanation');

    if (!result) return res.status(404).json({ success: false, message: 'Result not found' });

    // Authorization check
    if (req.user.role === 'student' && result.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student's own results
// @route   GET /api/results/my
exports.getMyResults = async (req, res) => {
  try {
    const results = await Result.find({ user: req.user._id, status: { $in: ['submitted', 'auto_submitted'] } })
      .populate('exam', 'title subject duration totalMarks')
      .sort('-submittedAt');

    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get results for a specific exam (examiner/admin)
// @route   GET /api/results/exam/:examId
exports.getExamResults = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    if (exam.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const results = await Result.find({ exam: req.params.examId, status: { $in: ['submitted', 'auto_submitted'] } })
      .populate('user', 'name email')
      .sort('-score');

    // Assign ranks
    const rankedResults = results.map((r, i) => ({ ...r.toObject(), rank: i + 1 }));

    res.json({ success: true, count: results.length, data: rankedResults });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get leaderboard for an exam
// @route   GET /api/results/exam/:examId/leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const results = await Result.find({ exam: req.params.examId, status: { $in: ['submitted', 'auto_submitted'] } })
      .populate('user', 'name')
      .sort('-score -timeTaken')
      .limit(20);

    const leaderboard = results.map((r, i) => ({
      rank: i + 1,
      name: r.user.name,
      score: r.score,
      totalMarks: r.totalMarks,
      percentage: r.percentage,
      timeTaken: r.timeTaken,
    }));

    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
