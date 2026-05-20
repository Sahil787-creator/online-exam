const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  selectedAnswer: {
    type: String,
    default: '',
  },
  isCorrect: {
    type: Boolean,
    default: false,
  },
  marksObtained: {
    type: Number,
    default: 0,
  },
  isMarkedForReview: {
    type: Boolean,
    default: false,
  },
  timeSpent: {
    type: Number,
    default: 0,
  },
}, { _id: false });

const resultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  answers: [answerSchema],
  score: {
    type: Number,
    default: 0,
  },
  totalMarks: {
    type: Number,
    default: 0,
  },
  percentage: {
    type: Number,
    default: 0,
  },
  isPassed: {
    type: Boolean,
    default: false,
  },
  timeTaken: {
    type: Number, // in seconds
    default: 0,
  },
  startedAt: {
    type: Date,
    required: true,
  },
  submittedAt: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['in_progress', 'submitted', 'auto_submitted'],
    default: 'in_progress',
  },
  rank: {
    type: Number,
  },
  feedback: {
    type: String,
    default: '',
  },
  aiFeedback: {
    type: String,
    default: '',
  },
}, { timestamps: true });

// Index for preventing duplicate active attempts
resultSchema.index({ user: 1, exam: 1, status: 1 });

module.exports = mongoose.model('Result', resultSchema);
