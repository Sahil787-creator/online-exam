import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Auth Pages
import Login from './pages/Login'
import Register from './pages/Register'

// Student Pages
import StudentDashboard from './pages/student/Dashboard'
import ExamList from './pages/student/ExamList'
import ExamAttempt from './pages/student/ExamAttempt'
import MyResults from './pages/student/MyResults'
import ResultDetail from './pages/student/ResultDetail'

// Examiner Pages
import ExaminerDashboard from './pages/examiner/Dashboard'
import ManageExams from './pages/examiner/ManageExams'
import CreateExam from './pages/examiner/CreateExam'
import EditExam from './pages/examiner/EditExam'
import ManageQuestions from './pages/examiner/ManageQuestions'
import ExamSubmissions from './pages/examiner/ExamSubmissions'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminExams from './pages/admin/Exams'

// Common
import Layout from './components/Common/Layout'
import NotFound from './pages/NotFound'
import Landing from './pages/Landing'

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-spinner" />
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

const RedirectIfLoggedIn = ({ children }) => {
  const { user } = useAuth()
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />
    if (user.role === 'examiner') return <Navigate to="/examiner" replace />
    return <Navigate to="/student" replace />
  }
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<RedirectIfLoggedIn><Login /></RedirectIfLoggedIn>} />
          <Route path="/register" element={<RedirectIfLoggedIn><Register /></RedirectIfLoggedIn>} />

          {/* Student */}
          <Route path="/student" element={<ProtectedRoute roles={['student']}><Layout /></ProtectedRoute>}>
            <Route index element={<StudentDashboard />} />
            <Route path="exams" element={<ExamList />} />
            <Route path="results" element={<MyResults />} />
            <Route path="results/:id" element={<ResultDetail />} />
          </Route>
          <Route path="/student/exam/:id" element={<ProtectedRoute roles={['student']}><ExamAttempt /></ProtectedRoute>} />

          {/* Examiner */}
          <Route path="/examiner" element={<ProtectedRoute roles={['examiner']}><Layout /></ProtectedRoute>}>
            <Route index element={<ExaminerDashboard />} />
            <Route path="exams" element={<ManageExams />} />
            <Route path="exams/create" element={<CreateExam />} />
            <Route path="exams/:id/edit" element={<EditExam />} />
            <Route path="exams/:id/questions" element={<ManageQuestions />} />
            <Route path="exams/:id/submissions" element={<ExamSubmissions />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="exams" element={<AdminExams />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
