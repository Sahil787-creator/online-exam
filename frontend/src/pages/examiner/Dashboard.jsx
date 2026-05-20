import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function ExaminerDashboard() {
  const { user } = useAuth()
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/exams').then(({ data }) => setExams(data.data || [])).catch(console.error).finally(() => setLoading(false))
  }, [])

  const stats = {
    total: exams.length,
    published: exams.filter(e => e.status === 'published').length,
    draft: exams.filter(e => e.status === 'draft').length,
    pending: exams.filter(e => e.status === 'pending_approval').length,
  }

  if (loading) return <div className="loading-overlay"><div className="loading-spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Welcome, {user?.name?.split(' ')[0]}! 👨‍🏫</h1><p className="page-subtitle">Manage your exams and track submissions</p></div>
        <Link to="/examiner/exams/create" className="btn btn-primary">+ Create Exam</Link>
      </div>
      <div className="stats-grid">
        {[
          { label: 'Total Exams', value: stats.total, icon: '📋', color: '#6c63ff' },
          { label: 'Published', value: stats.published, icon: '✅', color: '#10b981' },
          { label: 'Draft', value: stats.draft, icon: '📝', color: '#6b7280' },
          { label: 'Pending Approval', value: stats.pending, icon: '⏳', color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.color + '20' }}>{s.icon}</div>
            <div className="stat-info"><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'Syne,sans-serif' }}>Recent Exams</h3>
          <Link to="/examiner/exams" className="btn btn-secondary btn-sm">View All</Link>
        </div>
        {exams.length === 0 ? (
          <div className="empty-state"><span style={{ fontSize: 40 }}>📋</span><p>No exams yet. <Link to="/examiner/exams/create" style={{ color: 'var(--accent)' }}>Create your first exam!</Link></p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Title</th><th>Subject</th><th>Questions</th><th>Marks</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {exams.slice(0, 8).map(exam => (
                  <tr key={exam._id}>
                    <td><strong>{exam.title}</strong></td>
                    <td style={{ color: 'var(--text2)' }}>{exam.subject}</td>
                    <td>{exam.questions?.length || 0}</td>
                    <td>{exam.totalMarks}</td>
                    <td><span className={'badge badge-' + exam.status.replace('_approval', '').replace('pending', 'pending')}>{exam.status.replace('_', ' ')}</span></td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      <Link to={'/examiner/exams/' + exam._id + '/questions'} className="btn btn-sm btn-secondary">Questions</Link>
                      <Link to={'/examiner/exams/' + exam._id + '/submissions'} className="btn btn-sm btn-secondary">Results</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
