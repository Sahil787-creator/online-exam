const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['mcq', 'true_false', 'short_answer'],
    required: true,
    default: 'mcq',
  },
  options: [{
    type: String,
    trim: true,
  }],
  correctAnswer: {
    type: String,
    required: [true, 'Correct answer is required'],
  },
  marks: {
    type: Number,
    required: true,
    default: 1,
    min: [0.5, 'Marks must be positive'],
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  explanation: {
    type: String,
    default: '',
  },
  order: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
