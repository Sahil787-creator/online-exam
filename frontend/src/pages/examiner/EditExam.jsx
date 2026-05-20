import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function EditExam() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', subject: '', category: 'General', duration: 60, instructions: '', shuffleQuestions: false, allowMultipleAttempts: false, showResultImmediately: true })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/exams/' + id).then(({ data }) => {
      const e = data.data
      setForm({ title: e.title, description: e.description || '', subject: e.subject, category: e.category || 'General', duration: e.duration, instructions: e.instructions || '', shuffleQuestions: e.shuffleQuestions, allowMultipleAttempts: e.allowMultipleAttempts, showResultImmediately: e.showResultImmediately })
    }).catch(console.error).finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true); setError('')
    try { await api.put('/exams/' + id, form); navigate('/examiner/exams') }
    catch (err) { setError(err.response?.data?.message || 'Failed to update') }
    finally { setSaving(false) }
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))
  if (loading) return <div className="loading-overlay"><div className="loading-spinner" /></div>

  return (
    <div style={{ maxWidth: 700 }}>
      <div className="page-header"><h1 className="page-title">Edit Exam</h1></div>
      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Title *</label><input className="form-control" value={form.title} onChange={e => f('title', e.target.value)} required /></div>
            <div className="form-group"><label>Subject *</label><input className="form-control" value={form.subject} onChange={e => f('subject', e.target.value)} required /></div>
            <div className="form-group"><label>Duration (mins)</label><input className="form-control" type="number" value={form.duration} onChange={e => f('duration', parseInt(e.target.value))} min={1} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Description</label><textarea className="form-control" value={form.description} onChange={e => f('description', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Instructions</label><textarea className="form-control" value={form.instructions} onChange={e => f('instructions', e.target.value)} rows={3} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/examiner/exams')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
