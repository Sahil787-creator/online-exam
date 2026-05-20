import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

export default function MyResults() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/results/my').then(({ data }) => setResults(data.data || [])).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-overlay"><div className="loading-spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">My Results</h1><p className="page-subtitle">{results.length} exam attempts</p></div>
      </div>
      {results.length === 0 ? (
        <div className="empty-state"><span style={{ fontSize: 48 }}>📊</span><p>No results yet. <Link to="/student/exams" style={{ color: 'var(--accent)' }}>Take an exam!</Link></p></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Exam</th><th>Score</th><th>Percentage</th><th>Status</th><th>Time Taken</th><th>Date</th><th></th></tr>
            </thead>
            <tbody>
              {results.map(r => (
                <tr key={r._id}>
                  <td><strong>{r.exam?.title}</strong><br/><span style={{ fontSize: 12, color: 'var(--text3)' }}>{r.exam?.subject}</span></td>
                  <td style={{ fontWeight: 600 }}>{r.score}/{r.totalMarks}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 60, height: 6, background: 'var(--bg3)', borderRadius: 3 }}>
                        <div style={{ width: r.percentage + '%', height: '100%', background: r.isPassed ? 'var(--green)' : 'var(--red)', borderRadius: 3 }} />
                      </div>
                      <span>{r.percentage}%</span>
                    </div>
                  </td>
                  <td><span className={'badge ' + (r.isPassed ? 'badge-published' : 'badge-closed')}>{r.isPassed ? '✅ Passed' : '❌ Failed'}</span></td>
                  <td style={{ color: 'var(--text2)' }}>{Math.floor((r.timeTaken || 0) / 60)}m {(r.timeTaken || 0) % 60}s</td>
                  <td style={{ color: 'var(--text3)', fontSize: 13 }}>{new Date(r.submittedAt).toLocaleDateString()}</td>
                  <td><Link to={'/student/results/' + r._id} className="btn btn-sm btn-secondary">Details</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
