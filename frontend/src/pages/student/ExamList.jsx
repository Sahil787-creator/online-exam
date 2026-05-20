import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

export default function ExamList() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/exams').then(({ data }) => setExams(data.data || [])).catch(console.error).finally(() => setLoading(false))
  }, [])

  const filtered = exams.filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || e.subject.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="loading-overlay"><div className="loading-spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Available Exams</h1><p className="page-subtitle">{exams.length} exams available</p></div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <input className="form-control" placeholder="🔍 Search exams by title or subject..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 400 }} />
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state"><span style={{ fontSize: 48 }}>📋</span><p>No exams found</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map(exam => (
            <div key={exam._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 16, marginBottom: 4 }}>{exam.title}</h3>
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>{exam.subject}</span>
                </div>
                <span className="badge badge-published">Live</span>
              </div>
              {exam.description && <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{exam.description}</p>}
              <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text2)' }}>
                <span>⏱ {exam.duration} mins</span>
                <span>❓ {exam.questions?.length || 0} questions</span>
                <span>🎯 {exam.totalMarks} marks</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <Link to={'/student/exam/' + exam._id} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Start Exam →</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
