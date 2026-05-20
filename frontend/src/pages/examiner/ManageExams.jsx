import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

export default function ManageExams() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchExams = () => {
    api.get('/exams').then(({ data }) => setExams(data.data || [])).catch(console.error).finally(() => setLoading(false))
  }
  useEffect(fetchExams, [])

  const togglePublish = async (id) => {
    try { await api.put('/exams/' + id + '/publish'); fetchExams() }
    catch (e) { alert(e.response?.data?.message || 'Failed') }
  }
  const deleteExam = async (id) => {
    if (!confirm('Delete this exam and all its questions?')) return
    try { await api.delete('/exams/' + id); fetchExams() } catch (e) { alert('Failed to delete') }
  }

  if (loading) return <div className="loading-overlay"><div className="loading-spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">My Exams</h1><p className="page-subtitle">{exams.length} exams total</p></div>
        <Link to="/examiner/exams/create" className="btn btn-primary">+ Create Exam</Link>
      </div>
      {exams.length === 0 ? (
        <div className="empty-state"><span style={{ fontSize: 48 }}>📋</span><p>No exams yet.</p><Link to="/examiner/exams/create" className="btn btn-primary">Create First Exam</Link></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Title</th><th>Subject</th><th>Questions</th><th>Duration</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {exams.map(exam => (
                <tr key={exam._id}>
                  <td>
                    <strong>{exam.title}</strong>
                    {exam.description && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{exam.description.substring(0, 60)}...</div>}
                  </td>
                  <td style={{ color: 'var(--text2)' }}>{exam.subject}</td>
                  <td style={{ textAlign: 'center' }}>{exam.questions?.length || 0}</td>
                  <td style={{ color: 'var(--text2)' }}>{exam.duration} min</td>
                  <td><span className={'badge badge-' + (exam.status === 'pending_approval' ? 'pending' : exam.status)}>{exam.status.replace('_', ' ')}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <Link to={'/examiner/exams/' + exam._id + '/questions'} className="btn btn-sm btn-secondary">❓ Questions</Link>
                      <Link to={'/examiner/exams/' + exam._id + '/edit'} className="btn btn-sm btn-secondary">✏️ Edit</Link>
                      <Link to={'/examiner/exams/' + exam._id + '/submissions'} className="btn btn-sm btn-secondary">📊 Results</Link>
                      <button className={'btn btn-sm ' + (exam.status === 'published' ? 'btn-danger' : 'btn-success')} onClick={() => togglePublish(exam._id)}>
                        {exam.status === 'draft' ? '📤 Submit' : exam.status === 'published' ? '📥 Unpublish' : '⏳ Pending'}
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => deleteExam(exam._id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
