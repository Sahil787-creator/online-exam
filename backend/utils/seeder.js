const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const dotenv = require('dotenv')
dotenv.config()

const User = require('../models/User')
const Exam = require('../models/Exam')
const Question = require('../models/Question')

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online_exam_system')
    console.log('Connected to MongoDB')

    // Clear existing data
    await User.deleteMany({})
    await Exam.deleteMany({})
    await Question.deleteMany({})
    console.log('Cleared existing data')

    // Create admin
    const admin = await User.create({ name: 'Admin User', email: 'admin@exam.com', password: 'admin123', role: 'admin' })
    // Create examiner
    const examiner = await User.create({ name: 'Dr. John Smith', email: 'examiner@exam.com', password: 'exam123', role: 'examiner' })
    // Create students
    const student1 = await User.create({ name: 'Alice Johnson', email: 'student@exam.com', password: 'student123', role: 'student' })
    const student2 = await User.create({ name: 'Bob Williams', email: 'bob@exam.com', password: 'student123', role: 'student' })
    console.log('Created users')

    // Create a sample exam
    const exam = await Exam.create({
      title: 'Computer Science Fundamentals',
      description: 'Test your knowledge of basic CS concepts including data structures and algorithms.',
      subject: 'Computer Science',
      category: 'Computer Science',
      duration: 30,
      totalMarks: 10,
      passingMarks: 4,
      status: 'published',
      createdBy: examiner._id,
      instructions: 'Read each question carefully. Each MCQ has one correct answer. You cannot go back once you submit.',
    })

    // Create sample questions
    const questionsData = [
      { exam: exam._id, questionText: 'Which data structure uses LIFO order?', type: 'mcq', options: ['Queue', 'Stack', 'Tree', 'Graph'], correctAnswer: 'Stack', marks: 1, difficulty: 'easy', order: 0, explanation: 'Stack follows Last In First Out (LIFO) principle.' },
      { exam: exam._id, questionText: 'What is the time complexity of binary search?', type: 'mcq', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], correctAnswer: 'O(log n)', marks: 1, difficulty: 'medium', order: 1, explanation: 'Binary search divides the search space in half each time.' },
      { exam: exam._id, questionText: 'A linked list allows O(1) random access.', type: 'true_false', options: ['True', 'False'], correctAnswer: 'False', marks: 1, difficulty: 'easy', order: 2, explanation: 'Linked lists require O(n) traversal for random access.' },
      { exam: exam._id, questionText: 'Which sorting algorithm has best average case performance?', type: 'mcq', options: ['Bubble Sort', 'Insertion Sort', 'Quick Sort', 'Selection Sort'], correctAnswer: 'Quick Sort', marks: 1, difficulty: 'medium', order: 3, explanation: 'Quick Sort has O(n log n) average case complexity.' },
      { exam: exam._id, questionText: 'What is the primary purpose of a hash table?', type: 'mcq', options: ['Sequential storage', 'Fast key-value lookup', 'Sorting data', 'Tree traversal'], correctAnswer: 'Fast key-value lookup', marks: 1, difficulty: 'easy', order: 4, explanation: 'Hash tables provide O(1) average lookup by key.' },
      { exam: exam._id, questionText: 'DFS stands for Depth-First Search.', type: 'true_false', options: ['True', 'False'], correctAnswer: 'True', marks: 1, difficulty: 'easy', order: 5, explanation: 'DFS is Depth-First Search, exploring as deep as possible.' },
      { exam: exam._id, questionText: 'Which data structure is used for BFS traversal?', type: 'mcq', options: ['Stack', 'Queue', 'Heap', 'Array'], correctAnswer: 'Queue', marks: 1, difficulty: 'medium', order: 6, explanation: 'BFS uses a Queue for level-by-level traversal.' },
      { exam: exam._id, questionText: 'What does OOP stand for?', type: 'short_answer', options: [], correctAnswer: 'Object Oriented Programming', marks: 1, difficulty: 'easy', order: 7, explanation: 'OOP = Object Oriented Programming.' },
      { exam: exam._id, questionText: 'A binary tree can have at most how many children per node?', type: 'mcq', options: ['1', '2', '3', 'Unlimited'], correctAnswer: '2', marks: 1, difficulty: 'easy', order: 8, explanation: 'Binary trees have at most 2 children: left and right.' },
      { exam: exam._id, questionText: 'Which algorithm finds the shortest path in an unweighted graph?', type: 'mcq', options: ['DFS', 'BFS', 'Quick Sort', 'Binary Search'], correctAnswer: 'BFS', marks: 1, difficulty: 'medium', order: 9, explanation: 'BFS guarantees the shortest path in an unweighted graph.' },
    ]

    const questions = await Question.insertMany(questionsData)
    exam.questions = questions.map(q => q._id)
    await exam.save()
    console.log('Created sample exam with 10 questions')

    // Create a second exam
    const exam2 = await Exam.create({
      title: 'Mathematics Quiz - Algebra',
      description: 'Basic algebra concepts quiz.',
      subject: 'Mathematics',
      category: 'Mathematics',
      duration: 20,
      totalMarks: 5,
      passingMarks: 2,
      status: 'published',
      createdBy: examiner._id,
    })
    const mathQs = await Question.insertMany([
      { exam: exam2._id, questionText: 'What is the value of x if 2x + 4 = 10?', type: 'mcq', options: ['2', '3', '4', '5'], correctAnswer: '3', marks: 1, difficulty: 'easy', order: 0 },
      { exam: exam2._id, questionText: 'What is 15% of 200?', type: 'mcq', options: ['25', '30', '35', '40'], correctAnswer: '30', marks: 1, difficulty: 'easy', order: 1 },
      { exam: exam2._id, questionText: 'The square root of 144 is 12.', type: 'true_false', options: ['True', 'False'], correctAnswer: 'True', marks: 1, difficulty: 'easy', order: 2 },
      { exam: exam2._id, questionText: 'Simplify: 3(x + 2) = ?', type: 'mcq', options: ['3x + 2', '3x + 6', 'x + 6', '3x - 6'], correctAnswer: '3x + 6', marks: 1, difficulty: 'medium', order: 3 },
      { exam: exam2._id, questionText: 'If a triangle has angles 60°, 60°, what is the third angle?', type: 'mcq', options: ['30°', '60°', '90°', '120°'], correctAnswer: '60°', marks: 1, difficulty: 'easy', order: 4 },
    ])
    exam2.questions = mathQs.map(q => q._id)
    await exam2.save()
    console.log('Created mathematics exam')

    console.log('\n✅ Seeding complete!')
    console.log('=== Demo Accounts ===')
    console.log('Admin:    admin@exam.com    / admin123')
    console.log('Examiner: examiner@exam.com / exam123')
    console.log('Student:  student@exam.com  / student123')
    process.exit(0)
  } catch (err) {
    console.error('Seeding failed:', err)
    process.exit(1)
  }
}

seed()
