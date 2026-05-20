import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function CreateExam() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', subject: '', category: 'General', duration: 60, instructions: '', shuffleQuestions: false, allowMultipleAttempts: false, showResultImmediately: true })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const { data } = await api.post('/exams', form)
      navigate('/examiner/exams/' + data.data._id + '/questions')
    } catch (err) { setError(err.response?.data?.message || 'Failed to create exam') }
    finally { setLoading(false) }
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div style={{ maxWidth: 700 }}>
      <div className="page-header">
        <div><h1 className="page-title">Create New Exam</h1><p className="page-subtitle">Set up exam details. You can add questions next.</p></div>
      </div>
      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>Exam Title *</label>
              <input className="form-control" value={form.title} onChange={e => f('title', e.target.value)} placeholder="e.g. Database Management Final Exam" required />
            </div>
            <div className="form-group">
              <label>Subject *</label>
              <input className="form-control" value={form.subject} onChange={e => f('subject', e.target.value)} placeholder="e.g. Computer Science" required />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select className="form-control" value={form.category} onChange={e => f('category', e.target.value)}>
                {['General', 'Mathematics', 'Science', 'Computer Science', 'Engineering', 'Medical', 'Arts', 'Language', 'Other'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>Description</label>
              <textarea className="form-control" value={form.description} onChange={e => f('description', e.target.value)} placeholder="Brief description of the exam..." />
            </div>
            <div className="form-group">
              <label>Duration (minutes) *</label>
              <input className="form-control" type="number" value={form.duration} onChange={e => f('duration', parseInt(e.target.value))} min={1} max={480} required />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>Instructions for Students</label>
              <textarea className="form-control" value={form.instructions} onChange={e => f('instructions', e.target.value)} placeholder="Write exam rules and instructions..." rows={3} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', margin: '16px 0' }}>
            {[
              { key: 'shuffleQuestions', label: 'Shuffle Questions', desc: 'Randomize question order for each student' },
              { key: 'allowMultipleAttempts', label: 'Allow Multiple Attempts', desc: 'Students can retake this exam' },
              { key: 'showResultImmediately', label: 'Show Results Immediately', desc: 'Students see results right after submission' },
            ].map(opt => (
              <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <input type="checkbox" checked={form[opt.key]} onChange={e => f(opt.key, e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
                <div><div style={{ fontWeight: 500 }}>{opt.label}</div><div style={{ fontSize: 12, color: 'var(--text3)' }}>{opt.desc}</div></div>
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/examiner/exams')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create & Add Questions →'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
