import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ totalAttempted: 0, passed: 0, avgScore: 0, recentResults: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/results/my').then(({ data }) => {
      const results = data.data || []
      const passed = results.filter(r => r.isPassed).length
      const avgScore = results.length ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length) : 0
      setStats({ totalAttempted: results.length, passed, avgScore, recentResults: results.slice(0, 5) })
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-overlay"><div className="loading-spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="page-subtitle">Here is your exam performance overview</p>
        </div>
        <Link to="/student/exams" className="btn btn-primary">Browse Exams</Link>
      </div>
      <div className="stats-grid">
        {[
          { label: 'Exams Attempted', value: stats.totalAttempted, icon: '📝', color: '#3b82f6' },
          { label: 'Passed', value: stats.passed, icon: '✅', color: '#10b981' },
          { label: 'Failed', value: stats.totalAttempted - stats.passed, icon: '❌', color: '#ef4444' },
          { label: 'Avg Score', value: stats.avgScore + '%', icon: '📊', color: '#6c63ff' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.color + '20' }}>{s.icon}</div>
            <div className="stat-info"><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>
      <div className="card">
        <h3 style={{ fontFamily: 'Syne,sans-serif', marginBottom: 16 }}>Recent Results</h3>
        {stats.recentResults.length === 0 ? (
          <div className="empty-state">
            <span style={{ fontSize: 40 }}>📋</span>
            <p>No exam attempts yet. <Link to="/student/exams" style={{ color: 'var(--accent)' }}>Take your first exam!</Link></p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Exam</th><th>Score</th><th>%</th><th>Status</th><th>Date</th><th></th></tr></thead>
              <tbody>
                {stats.recentResults.map(r => (
                  <tr key={r._id}>
                    <td><strong>{r.exam?.title}</strong><br/><span style={{ fontSize: 12, color: 'var(--text3)' }}>{r.exam?.subject}</span></td>
                    <td>{r.score}/{r.totalMarks}</td>
                    <td>{r.percentage}%</td>
                    <td><span className={'badge ' + (r.isPassed ? 'badge-published' : 'badge-closed')}>{r.isPassed ? 'Passed' : 'Failed'}</span></td>
                    <td style={{ color: 'var(--text3)', fontSize: 13 }}>{new Date(r.submittedAt).toLocaleDateString()}</td>
                    <td><Link to={'/student/results/' + r._id} className="btn btn-sm btn-secondary">View</Link></td>
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
