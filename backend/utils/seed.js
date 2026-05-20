const mongoose = require('mongoose')
require('dotenv').config()

const User = require('../models/User')
const Exam = require('../models/Exam')
const Question = require('../models/Question')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/online_exam_system'

async function seed() {
  await mongoose.connect(MONGODB_URI)
  console.log('Connected to MongoDB')
  await Promise.all([User.deleteMany(), Exam.deleteMany(), Question.deleteMany()])
  console.log('Cleared existing data')

  const [admin, examiner, student] = await User.create([
    { name: 'Admin User', email: 'admin@exam.com', password: 'admin123', role: 'admin' },
    { name: 'John Examiner', email: 'examiner@exam.com', password: 'exam123', role: 'examiner' },
    { name: 'Jane Student', email: 'student@exam.com', password: 'student123', role: 'student' },
  ])

  const exam = await Exam.create({
    title: 'JavaScript Fundamentals', description: 'Test your JavaScript basics knowledge',
    subject: 'Computer Science', category: 'Computer Science', duration: 30,
    createdBy: examiner._id, status: 'published',
    instructions: 'Read each question carefully. Each correct answer carries the marks mentioned.',
  })

  const questions = await Question.insertMany([
    { exam: exam._id, questionText: 'Which of the following is NOT a JavaScript data type?', type: 'mcq', options: ['String', 'Boolean', 'Float', 'Symbol'], correctAnswer: 'Float', marks: 1, difficulty: 'easy', explanation: 'JavaScript has Number, not Float.' },
    { exam: exam._id, questionText: 'JavaScript is a case-sensitive language.', type: 'true_false', options: ['True', 'False'], correctAnswer: 'True', marks: 1, difficulty: 'easy' },
    { exam: exam._id, questionText: 'Which keyword declares a constant in JavaScript?', type: 'mcq', options: ['var', 'let', 'const', 'define'], correctAnswer: 'const', marks: 1, difficulty: 'easy' },
    { exam: exam._id, questionText: 'What does DOM stand for?', type: 'mcq', options: ['Document Object Model', 'Data Object Module', 'Document Oriented Model', 'Data Oriented Module'], correctAnswer: 'Document Object Model', marks: 2, difficulty: 'medium' },
    { exam: exam._id, questionText: 'Which method parses a JSON string?', type: 'mcq', options: ['JSON.parse()', 'JSON.stringify()', 'JSON.decode()', 'JSON.convert()'], correctAnswer: 'JSON.parse()', marks: 2, difficulty: 'medium' },
  ])

  const totalMarks = questions.reduce((s, q) => s + q.marks, 0)
  exam.questions = questions.map(q => q._id)
  exam.totalMarks = totalMarks
  exam.passingMarks = Math.ceil(totalMarks * 0.4)
  await exam.save()

  console.log('Seed complete!')
  console.log('Demo: admin@exam.com/admin123 | examiner@exam.com/exam123 | student@exam.com/student123')
  await mongoose.disconnect()
}

seed().catch(err => { console.error(err); process.exit(1) })
