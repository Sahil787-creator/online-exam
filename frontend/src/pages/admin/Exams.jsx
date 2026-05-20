import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function AdminExams() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    api.get('/admin/exams').then(r => setExams(r.data.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleApprove = async (id, action) => {
    try {
      const { data } = await api.put('/admin/exams/' + id + '/approve', { action })
      setExams(exams.map(e => e._id === id ? data.data : e))
    } catch (err) { alert(err.response?.data?.message || 'Error') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this exam?')) return
    await api.delete('/exams/' + id)
    setExams(exams.filter(e => e._id !== id))
  }

  const filtered = filter ? exams.filter(e => e.status === filter) : exams

  if (loading) return <div className="loading-overlay"><div className="loading-spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Exam Management 📋</h1>
          <p className="page-subtitle">{exams.length} total exams · {exams.filter(e => e.status === 'pending_approval').length} pending approval</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['', 'draft', 'pending_approval', 'published', 'closed'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={'btn btn-sm ' + (filter === s ? 'btn-primary' : 'btn-secondary')}>
            {s === '' ? 'All' : s === 'pending_approval' ? 'Pending' : s.charAt(0).toUpperCase() + s.slice(1)}
            {s === 'pending_approval' && exams.filter(e => e.status === s).length > 0 && (
              <span style={{ background: 'var(--red)', color: 'white', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, marginLeft: 4 }}>
                {exams.filter(e => e.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="table-wrapper">
        <table>
          <thead><tr><th>Exam</th><th>Created By</th><th>Questions</th><th>Marks</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e._id}>
                <td>
                  <div style={{ fontWeight: 500 }}>{e.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{e.subject} · {e.duration}m</div>
                </td>
                <td>
                  <div style={{ fontSize: 14 }}>{e.createdBy?.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{e.createdBy?.email}</div>
                </td>
                <td>{e.questions?.length || 0}</td>
                <td>{e.totalMarks}</td>
                <td><span className={'badge badge-' + (e.status === 'published' ? 'published' : e.status === 'pending_approval' ? 'pending' : e.status === 'closed' ? 'closed' : 'draft')}>{e.status === 'pending_approval' ? 'Pending' : e.status}</span></td>
                <td style={{ color: 'var(--text3)', fontSize: 13 }}>{new Date(e.createdAt).toLocaleDateString()}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {e.status === 'pending_approval' && (
                      <>
                        <button onClick={() => handleApprove(e._id, 'approve')} className="btn btn-sm btn-success">✅ Approve</button>
                        <button onClick={() => handleApprove(e._id, 'reject')} className="btn btn-sm btn-danger">❌ Reject</button>
                      </>
                    )}
                    {e.status === 'published' && (
                      <button onClick={() => handleApprove(e._id, 'reject')} className="btn btn-sm btn-secondary">Unpublish</button>
                    )}
                    {e.status === 'draft' && (
                      <button onClick={() => handleApprove(e._id, 'approve')} className="btn btn-sm btn-success">Publish</button>
                    )}
                    <button onClick={() => handleDelete(e._id)} className="btn btn-sm btn-danger">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && <div className="empty-state"><span style={{ fontSize: 48 }}>📋</span><p>No exams found</p></div>}
    </div>
  )
}
