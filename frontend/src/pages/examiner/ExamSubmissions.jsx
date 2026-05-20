import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../services/api'

export default function ExamSubmissions() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [exam, setExam] = useState(null)
  const [results, setResults] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('results')

  useEffect(() => {
    Promise.all([
      api.get('/exams/' + id),
      api.get('/results/exam/' + id),
      api.get('/results/exam/' + id + '/leaderboard'),
    ]).then(([examRes, resultsRes, lbRes]) => {
      setExam(examRes.data.data)
      setResults(resultsRes.data.data)
      setLeaderboard(lbRes.data.data)
    }).catch(console.error).finally(() => setLoading(false))
  }, [id])

  const stats = results.length ? {
    avgScore: Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length),
    passed: results.filter(r => r.isPassed).length,
    highScore: Math.max(...results.map(r => r.score)),
  } : { avgScore: 0, passed: 0, highScore: 0 }

  if (loading) return <div className="loading-overlay"><div className="loading-spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <button onClick={() => navigate('/examiner/exams')} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: 13, marginBottom: 8 }}>← Back to Exams</button>
          <h1 className="page-title">Submissions</h1>
          <p className="page-subtitle">{exam?.title} · {results.length} submissions</p>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        {[
          { label: 'Total Submissions', value: results.length, icon: '📋', color: '#3b82f6' },
          { label: 'Passed', value: stats.passed, icon: '✅', color: '#10b981' },
          { label: 'Avg Score', value: stats.avgScore + '%', icon: '📊', color: '#6c63ff' },
          { label: 'High Score', value: stats.highScore + '/' + exam?.totalMarks, icon: '🏆', color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.color + '20' }}>{s.icon}</div>
            <div className="stat-info"><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg3)', padding: 4, borderRadius: 8, width: 'fit-content' }}>
        {['results', 'leaderboard'].map(t => (
          <button key={t} onClick={() => setTab(t)} className="btn btn-sm" style={{ background: tab === t ? 'var(--accent)' : 'transparent', color: tab === t ? 'white' : 'var(--text2)', border: 'none', textTransform: 'capitalize' }}>{t}</button>
        ))}
      </div>

      {tab === 'results' && (
        results.length === 0 ? <div className="empty-state"><span style={{ fontSize: 48 }}>📭</span><p>No submissions yet</p></div> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Student</th><th>Score</th><th>Percentage</th><th>Status</th><th>Time Taken</th><th>Submitted</th><th></th></tr></thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={r._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(108,99,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>{r.user?.name?.charAt(0)}</div>
                        <div><div style={{ fontWeight: 500 }}>{r.user?.name}</div><div style={{ fontSize: 12, color: 'var(--text3)' }}>{r.user?.email}</div></div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{r.score}/{r.totalMarks}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 60, height: 6, background: 'var(--bg3)', borderRadius: 3 }}>
                          <div style={{ width: r.percentage + '%', height: '100%', background: r.isPassed ? 'var(--green)' : 'var(--red)', borderRadius: 3 }} />
                        </div>
                        {r.percentage}%
                      </div>
                    </td>
                    <td><span className={'badge ' + (r.isPassed ? 'badge-published' : 'badge-closed')}>{r.isPassed ? 'Pass' : 'Fail'}</span></td>
                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>{Math.floor((r.timeTaken || 0) / 60)}m {(r.timeTaken || 0) % 60}s</td>
                    <td style={{ color: 'var(--text3)', fontSize: 13 }}>{r.submittedAt ? new Date(r.submittedAt).toLocaleString() : '-'}</td>
                    <td><Link to={'/student/results/' + r._id} className="btn btn-sm btn-secondary">Details</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {tab === 'leaderboard' && (
        leaderboard.length === 0 ? <div className="empty-state"><span style={{ fontSize: 48 }}>🏆</span><p>No submissions yet</p></div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {leaderboard.map((entry, i) => (
              <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderColor: i === 0 ? '#f59e0b44' : i === 1 ? '#9ca3af44' : i === 2 ? '#cd7c3244' : 'var(--border)' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: i === 0 ? 'rgba(245,158,11,0.2)' : i === 1 ? 'rgba(156,163,175,0.2)' : i === 2 ? 'rgba(205,124,50,0.2)' : 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : i === 2 ? '#cd7c32' : 'var(--text3)' }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '#' + (i + 1)}
                </div>
                <div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>{entry.name}</div></div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18 }}>{entry.score}/{entry.totalMarks}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{entry.percentage}%</div>
                </div>
                <div style={{ textAlign: 'right', minWidth: 70 }}>
                  <div style={{ fontSize: 13, color: 'var(--text2)' }}>{Math.floor(entry.timeTaken / 60)}m {entry.timeTaken % 60}s</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>time taken</div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
