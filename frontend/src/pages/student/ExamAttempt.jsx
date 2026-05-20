import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function ExamAttempt() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [exam, setExam] = useState(null)
  const [resultId, setResultId] = useState(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState({})
  const [markedReview, setMarkedReview] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [startedAt] = useState(Date.now())
  const timerRef = useRef()

  useEffect(() => {
    const init = async () => {
      try {
        // Get exam data
        const { data: examData } = await api.get('/exams/' + id + '/attempt')
        setExam(examData.data)
        setTimeLeft(examData.data.duration * 60)
        // Start attempt
        const { data: resultData } = await api.post('/results/start', { examId: id })
        setResultId(resultData.data._id)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to start exam')
        if (err.response?.data?.resultId) {
          setTimeout(() => navigate('/student/results/' + err.response.data.resultId), 2000)
        }
      } finally { setLoading(false) }
    }
    init()
    // Prevent copy paste
    const noop = e => e.preventDefault()
    document.addEventListener('copy', noop)
    document.addEventListener('paste', noop)
    document.addEventListener('contextmenu', noop)
    return () => {
      document.removeEventListener('copy', noop)
      document.removeEventListener('paste', noop)
      document.removeEventListener('contextmenu', noop)
    }
  }, [id, navigate])

  const submitExam = useCallback(async (auto = false) => {
    if (!resultId || submitting) return
    setSubmitting(true)
    const timeTaken = Math.floor((Date.now() - startedAt) / 1000)
    const answersArr = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
      questionId, selectedAnswer, isMarkedForReview: !!markedReview[questionId]
    }))
    try {
      const { data } = await api.post('/results/' + resultId + '/submit', { answers: answersArr, timeTaken, autoSubmit: auto })
      navigate('/student/results/' + resultId)
    } catch (e) { setSubmitting(false); setError('Submission failed. Try again.') }
  }, [resultId, answers, markedReview, startedAt, navigate, submitting])

  useEffect(() => {
    if (!exam || timeLeft <= 0) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); submitExam(true); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [exam, submitExam])

  if (loading) return <div className="loading-overlay"><div className="loading-spinner" /></div>
  if (error) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="alert alert-error" style={{ maxWidth: 400 }}>{error}</div></div>
  if (!exam) return null

  const questions = exam.questions || []
  const q = questions[currentQ]
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')
  const timerClass = timeLeft < 60 ? 'danger' : timeLeft < 300 ? 'warning' : ''
  const answeredCount = Object.keys(answers).length

  return (
    <div className="exam-attempt-page" style={{ userSelect: 'none' }}>
      {/* Top bar */}
      <div className="exam-topbar">
        <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16 }}>{exam.title}</div>
        <div className={'timer-display ' + timerClass}>⏱ {mins}:{secs}</div>
        <button className="btn btn-primary btn-sm" onClick={() => { if (confirm('Submit exam now?')) submitExam(false) }} disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Exam'}
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, gap: 0 }}>
        {/* Sidebar: question navigation */}
        <div style={{ width: 220, background: 'var(--card)', borderRight: '1px solid var(--border)', padding: 16, overflowY: 'auto', flexShrink: 0 }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Questions</div>
          <div className="question-nav" style={{ padding: 0, border: 'none', background: 'none' }}>
            {questions.map((_, i) => {
              let cls = 'q-nav-btn'
              if (i === currentQ) cls += ' current'
              else if (markedReview[questions[i]._id]) cls += ' review'
              else if (answers[questions[i]._id]) cls += ' answered'
              return <button key={i} className={cls} onClick={() => setCurrentQ(i)}>{i + 1}</button>
            })}
          </div>
          <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text3)', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><div style={{ width: 14, height: 14, background: 'rgba(16,185,129,0.2)', border: '1px solid var(--green)', borderRadius: 3 }} /><span>Answered ({answeredCount})</span></div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><div style={{ width: 14, height: 14, background: 'rgba(245,158,11,0.2)', border: '1px solid var(--yellow)', borderRadius: 3 }} /><span>Review ({Object.keys(markedReview).filter(k => markedReview[k]).length})</span></div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><div style={{ width: 14, height: 14, background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 3 }} /><span>Not visited</span></div>
          </div>
        </div>

        {/* Question area */}
        <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
          {q && (
            <div style={{ maxWidth: 720 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontSize: 13, color: 'var(--text3)' }}>Question {currentQ + 1} of {questions.length}</span>
                <span className="badge badge-pending">{q.marks} mark{q.marks > 1 ? 's' : ''}</span>
              </div>
              <div style={{ fontSize: 17, fontWeight: 500, marginBottom: 24, lineHeight: 1.6, color: 'var(--text)' }}>{q.questionText}</div>

              {/* Options */}
              {(q.type === 'mcq' || q.type === 'true_false') && q.options.map((opt, i) => (
                <div key={i} className={'option-item' + (answers[q._id] === opt ? ' selected' : '')} onClick={() => setAnswers(a => ({ ...a, [q._id]: opt }))}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid ' + (answers[q._id] === opt ? 'var(--accent)' : 'var(--border2)'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {answers[q._id] === opt && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />}
                  </div>
                  {opt}
                </div>
              ))}

              {q.type === 'short_answer' && (
                <textarea className="form-control" rows={4} placeholder="Type your answer here..." value={answers[q._id] || ''} onChange={e => setAnswers(a => ({ ...a, [q._id]: e.target.value }))} />
              )}

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setCurrentQ(c => Math.max(0, c - 1))} disabled={currentQ === 0}>← Prev</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setCurrentQ(c => Math.min(questions.length - 1, c + 1))} disabled={currentQ === questions.length - 1}>Next →</button>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-sm" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--yellow)', border: '1px solid rgba(245,158,11,0.3)' }}
                    onClick={() => setMarkedReview(m => ({ ...m, [q._id]: !m[q._id] }))}>
                    {markedReview[q._id] ? '🔖 Marked' : '🏷 Mark Review'}
                  </button>
                  {answers[q._id] && <button className="btn btn-secondary btn-sm" onClick={() => setAnswers(a => { const n = {...a}; delete n[q._id]; return n })}>Clear</button>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
