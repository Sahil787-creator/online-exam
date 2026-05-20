const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Exam title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required (in minutes)'],
    min: [1, 'Duration must be at least 1 minute'],
  },
  totalMarks: {
    type: Number,
    default: 0,
  },
  passingMarks: {
    type: Number,
    default: 0,
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'published', 'closed'],
    default: 'draft',
  },
  scheduledStart: {
    type: Date,
  },
  scheduledEnd: {
    type: Date,
  },
  allowedStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isPublic: {
    type: Boolean,
    default: true,
  },
  allowMultipleAttempts: {
    type: Boolean,
    default: false,
  },
  shuffleQuestions: {
    type: Boolean,
    default: false,
  },
  showResultImmediately: {
    type: Boolean,
    default: true,
  },
  instructions: {
    type: String,
    default: '',
  },
  tags: [String],
  category: {
    type: String,
    default: 'General',
  },
}, { timestamps: true });

// Auto calculate totalMarks
examSchema.methods.calculateTotalMarks = async function () {
  const Question = require('./Question');
  const questions = await Question.find({ exam: this._id });
  this.totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
  this.passingMarks = Math.ceil(this.totalMarks * 0.4);
  await this.save();
};

module.exports = mongoose.model('Exam', examSchema);
