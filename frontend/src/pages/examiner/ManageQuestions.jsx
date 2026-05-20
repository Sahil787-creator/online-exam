import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'

const emptyQ = { questionText: '', type: 'mcq', options: ['', '', '', ''], correctAnswer: '', marks: 1, difficulty: 'medium', explanation: '' }

export default function ManageQuestions() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [exam, setExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyQ)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiForm, setAiForm] = useState({ topic: '', count: 5, difficulty: 'medium', type: 'mcq' })
  const [showAiPanel, setShowAiPanel] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/exams/' + id),
      api.get('/questions/exam/' + id)
    ]).then(([examRes, qRes]) => {
      setExam(examRes.data.data)
      setQuestions(qRes.data.data)
    }).catch(console.error).finally(() => setLoading(false))
  }, [id])

  const handleOptionChange = (i, val) => {
    const opts = [...form.options]
    opts[i] = val
    setForm({ ...form, options: opts })
  }

  const handleTypeChange = (type) => {
    if (type === 'true_false') setForm({ ...form, type, options: ['True', 'False'], correctAnswer: '' })
    else if (type === 'short_answer') setForm({ ...form, type, options: [], correctAnswer: '' })
    else setForm({ ...form, type, options: ['', '', '', ''], correctAnswer: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true)
    try {
      if (editId) {
        const { data } = await api.put('/questions/' + editId, form)
        setQuestions(questions.map(q => q._id === editId ? data.data : q))
      } else {
        const { data } = await api.post('/questions', { ...form, examId: id })
        setQuestions([...questions, data.data])
      }
      setForm(emptyQ); setShowForm(false); setEditId(null)
    } catch (err) { setError(err.response?.data?.message || 'Error saving') }
    finally { setSaving(false) }
  }

  const handleEdit = (q) => {
    setForm({ questionText: q.questionText, type: q.type, options: q.options?.length ? q.options : ['','','',''], correctAnswer: q.correctAnswer, marks: q.marks, difficulty: q.difficulty, explanation: q.explanation || '' })
    setEditId(q._id); setShowForm(true)
  }

  const handleDelete = async (qid) => {
    if (!confirm('Delete this question?')) return
    await api.delete('/questions/' + qid)
    setQuestions(questions.filter(q => q._id !== qid))
  }

  const handleAiGenerate = async () => {
    setAiLoading(true); setError('')
    try {
      const { data } = await api.post('/ai/generate-questions', aiForm)
      const { data: bulkData } = await api.post('/questions/bulk', { examId: id, questions: data.data })
      setQuestions([...questions, ...bulkData.data])
      setShowAiPanel(false)
    } catch (err) { setError(err.response?.data?.message || 'AI generation failed. Check GROQ_API_KEY.') }
    finally { setAiLoading(false) }
  }

  if (loading) return <div className="loading-overlay"><div className="loading-spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <button onClick={() => navigate('/examiner/exams')} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: 13, marginBottom: 8 }}>← Back to Exams</button>
          <h1 className="page-title">Questions</h1>
          <p className="page-subtitle">{exam?.title} · {questions.length} questions · {exam?.totalMarks} total marks</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setShowAiPanel(!showAiPanel)} className="btn btn-secondary">🤖 AI Generate</button>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyQ) }} className="btn btn-primary">+ Add Question</button>
        </div>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* AI Panel */}
      {showAiPanel && (
        <div className="card" style={{ marginBottom: 20, borderColor: 'var(--accent)', background: 'rgba(108,99,255,0.05)' }}>
          <h3 style={{ fontFamily: 'Syne,sans-serif', marginBottom: 16 }}>🤖 AI Question Generator</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Topic / Subject</label>
              <input className="form-control" placeholder="e.g. Database Management" value={aiForm.topic} onChange={e => setAiForm({ ...aiForm, topic: e.target.value })} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Number of Questions</label>
              <select className="form-control" value={aiForm.count} onChange={e => setAiForm({ ...aiForm, count: Number(e.target.value) })}>
                {[3,5,10,15,20].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Difficulty</label>
              <select className="form-control" value={aiForm.difficulty} onChange={e => setAiForm({ ...aiForm, difficulty: e.target.value })}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Type</label>
              <select className="form-control" value={aiForm.type} onChange={e => setAiForm({ ...aiForm, type: e.target.value })}>
                <option value="mcq">MCQ</option>
                <option value="true_false">True/False</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
            <button onClick={handleAiGenerate} className="btn btn-primary" disabled={aiLoading || !aiForm.topic}>
              {aiLoading ? 'Generating...' : '⚡ Generate Questions'}
            </button>
            <button onClick={() => setShowAiPanel(false)} className="btn btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Question Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Syne,sans-serif', marginBottom: 16 }}>{editId ? 'Edit Question' : 'Add Question'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Question Text</label>
              <textarea className="form-control" rows={3} placeholder="Enter your question here..." value={form.questionText} onChange={e => setForm({ ...form, questionText: e.target.value })} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Type</label>
                <select className="form-control" value={form.type} onChange={e => handleTypeChange(e.target.value)}>
                  <option value="mcq">MCQ</option>
                  <option value="true_false">True / False</option>
                  <option value="short_answer">Short Answer</option>
                </select>
              </div>
              <div className="form-group">
                <label>Marks</label>
                <input className="form-control" type="number" min={0.5} step={0.5} value={form.marks} onChange={e => setForm({ ...form, marks: Number(e.target.value) })} />
              </div>
              <div className="form-group">
                <label>Difficulty</label>
                <select className="form-control" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            {form.type === 'mcq' && (
              <div className="form-group">
                <label>Options (enter all 4)</label>
                {form.options.map((opt, i) => (
                  <input key={i} className="form-control" style={{ marginBottom: 8 }} placeholder={`Option ${String.fromCharCode(65+i)}`} value={opt} onChange={e => handleOptionChange(i, e.target.value)} />
                ))}
              </div>
            )}

            <div className="form-group">
              <label>Correct Answer</label>
              {form.type === 'true_false' ? (
                <select className="form-control" value={form.correctAnswer} onChange={e => setForm({ ...form, correctAnswer: e.target.value })} required>
                  <option value="">Select...</option>
                  <option value="True">True</option>
                  <option value="False">False</option>
                </select>
              ) : form.type === 'mcq' ? (
                <select className="form-control" value={form.correctAnswer} onChange={e => setForm({ ...form, correctAnswer: e.target.value })} required>
                  <option value="">Select correct option...</option>
                  {form.options.filter(o => o).map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <input className="form-control" placeholder="Type the correct answer" value={form.correctAnswer} onChange={e => setForm({ ...form, correctAnswer: e.target.value })} required />
              )}
            </div>

            <div className="form-group">
              <label>Explanation (optional)</label>
              <textarea className="form-control" rows={2} placeholder="Explain why this answer is correct..." value={form.explanation} onChange={e => setForm({ ...form, explanation: e.target.value })} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update Question' : 'Add Question'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyQ) }} className="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="empty-state"><span style={{ fontSize: 48 }}>❓</span><p>No questions yet. Add some manually or use AI generation.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {questions.map((q, idx) => (
            <div key={q._id} className="card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 600 }}>Q{idx + 1}.</span>
                    <span className="badge badge-draft">{q.type}</span>
                    <span className="badge badge-student">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                    <span className="badge" style={{ background: q.difficulty === 'easy' ? 'rgba(16,185,129,0.15)' : q.difficulty === 'hard' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: q.difficulty === 'easy' ? 'var(--green)' : q.difficulty === 'hard' ? 'var(--red)' : 'var(--yellow)' }}>{q.difficulty}</span>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text)', marginBottom: 10, lineHeight: 1.5 }}>{q.questionText}</p>
                  {q.options?.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4 }}>
                      {q.options.map((opt, i) => (
                        <div key={i} style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6, background: opt === q.correctAnswer ? 'rgba(16,185,129,0.15)' : 'var(--bg3)', color: opt === q.correctAnswer ? 'var(--green)' : 'var(--text2)', border: opt === q.correctAnswer ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border)' }}>
                          {String.fromCharCode(65+i)}. {opt}
                        </div>
                      ))}
                    </div>
                  )}
                  {q.type === 'short_answer' && <div style={{ fontSize: 13, color: 'var(--green)', marginTop: 6 }}>✓ Answer: {q.correctAnswer}</div>}
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => handleEdit(q)} className="btn btn-sm btn-secondary">✏️ Edit</button>
                  <button onClick={() => handleDelete(q._id)} className="btn btn-sm btn-danger">🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
