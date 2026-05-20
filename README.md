# 🎓 ExamPro — Online Examination System
A full-stack MERN application for conducting digital exams with role-based access, AI-powered features, and real-time analytics.

## 🛠️ Tech Stack
- **Frontend**: React 18 + Vite, React Router v6, Recharts, Lucide React
- **Backend**: Node.js, Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcryptjs
- **AI**: Groq API (LLaMA 3)

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- (Optional) Groq API key for AI features

---

### 1. Clone & Setup Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
```

### 2. Seed Database (Demo Data)

```bash
npm run seed
```

This creates:
- **Admin**: admin@exam.com / admin123
- **Examiner**: examiner@exam.com / exam123
- **Student**: student@exam.com / student123
- 2 sample published exams with questions

### 3. Start Backend

```bash
npm run dev      # development (nodemon)
# or
npm start        # production
```
Backend runs on: http://localhost:5000

---

### 4. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: http://localhost:5173

---

## 👥 User Roles

### 👨‍🎓 Student
- Register/Login
- Browse and take published exams
- Real-time countdown timer with auto-submit
- View detailed results with answer review
- AI-generated performance feedback
- Track all past results

### 👨‍🏫 Examiner
- Create and manage exams
- Add questions (MCQ, True/False, Short Answer)
- **AI Question Generator** (requires GROQ_API_KEY)
- Submit exams for admin approval
- View student submissions and leaderboard

### 🛠️ Admin
- Dashboard with analytics and charts
- Manage all users (activate/deactivate/change role)
- Approve or reject exam submissions
- Full system oversight

---

## 🔥 Key Features

| Feature | Details |
|---|---|
| **Auth** | JWT, bcrypt, protected routes |
| **Exam Timer** | Countdown with auto-submit |
| **Anti-cheat** | Copy/paste disabled, context menu blocked |
| **Auto Grading** | MCQ and True/False auto-evaluated instantly |
| **AI Questions** | Generate questions via Groq (LLaMA 3) |
| **AI Feedback** | Personalized performance analysis |
| **Leaderboard** | Ranked results per exam |
| **Analytics** | Charts for submissions, avg score trends |
| **Bulk Questions** | Add multiple questions at once |

---

## 📁 Project Structure

```
online-exam-system/
├── backend/
│   ├── config/         # DB connection
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Auth middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # Express routes
│   ├── utils/          # Seeder script
│   ├── .env.example
│   └── server.js
│
└── frontend/
    └── src/
        ├── components/ # Reusable components (Layout)
        ├── context/    # Auth context
        ├── pages/
        │   ├── student/    # Dashboard, ExamList, ExamAttempt, Results
        │   ├── examiner/   # Dashboard, ManageExams, ManageQuestions, Submissions
        │   └── admin/      # Dashboard, Users, Exams
        ├── services/   # Axios API config
        ├── App.jsx
        └── main.jsx
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |

### Exams
| Method | Endpoint | Access |
|---|---|---|
| GET | /api/exams | All (filtered by role) |
| POST | /api/exams | Examiner/Admin |
| PUT | /api/exams/:id | Examiner/Admin |
| DELETE | /api/exams/:id | Examiner/Admin |
| PUT | /api/exams/:id/publish | Examiner/Admin |
| GET | /api/exams/:id/attempt | Student |

### Questions
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/questions | Examiner/Admin |
| POST | /api/questions/bulk | Examiner/Admin |
| GET | /api/questions/exam/:id | Examiner/Admin |
| PUT | /api/questions/:id | Examiner/Admin |
| DELETE | /api/questions/:id | Examiner/Admin |

### Results
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/results/start | Student |
| POST | /api/results/:id/submit | Student |
| GET | /api/results/my | Student |
| GET | /api/results/:id | All |
| GET | /api/results/exam/:id | Examiner/Admin |
| GET | /api/results/exam/:id/leaderboard | All |

### Admin
| Method | Endpoint | Access |
|---|---|---|
| GET | /api/admin/stats | Admin |
| GET | /api/admin/users | Admin |
| PUT | /api/admin/users/:id/toggle | Admin |
| PUT | /api/admin/users/:id/role | Admin |
| DELETE | /api/admin/users/:id | Admin |
| GET | /api/admin/exams | Admin |
| PUT | /api/admin/exams/:id/approve | Admin |

### AI
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/ai/generate-questions | Examiner/Admin |
| POST | /api/ai/feedback | All |
| POST | /api/ai/difficulty | Examiner/Admin |

---

## 🤖 AI Features Setup

1. Get a free API key from [console.groq.com](https://console.groq.com)
2. Add to backend `.env`:
   ```
   GROQ_API_KEY=your_key_here
   ```
3. Restart the server

AI features:
- **Question Generator**: Examiners can auto-generate MCQ/True-False questions for any topic
- **Performance Feedback**: Students get personalized analysis after each exam
- **Difficulty Assessment**: AI evaluates overall exam difficulty

---

## 🔒 Security
- JWT tokens with 7-day expiry
- Passwords hashed with bcrypt (12 rounds)
- Role-based route protection
- Copy/paste disabled during exams
- Right-click blocked during exams
- Multiple attempt prevention (configurable)

---

## 📊 MongoDB Models

**User**: name, email, password, role, isActive, lastLogin  
**Exam**: title, description, subject, duration, questions[], createdBy, status, scheduledStart/End  
**Question**: exam, questionText, type, options[], correctAnswer, marks, difficulty  
**Result**: user, exam, answers[], score, percentage, isPassed, timeTaken, status

