import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '../../services/api'

export default function ResultDetail() {
  const { id } = useParams()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [aiFeedback, setAiFeedback] = useState('')
  const [loadingAI, setLoadingAI] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    api.get('/results/' + id).then(({ data }) => setResult(data.data)).catch(console.error).finally(() => setLoading(false))
  }, [id])

  const getAIFeedback = async () => {
    setLoadingAI(true)
    try {
      const wrongTopics = result.answers.filter(a => !a.isCorrect).map(a => a.question?.questionText?.substring(0, 30))
      const { data } = await api.post('/ai/feedback', {
        score: result.score, totalMarks: result.totalMarks, percentage: result.percentage,
        subject: result.exam?.subject, examTitle: result.exam?.title,
        wrongTopics, timeTaken: result.timeTaken
      })
      setAiFeedback(data.feedback)
    } catch (e) { setAiFeedback('AI feedback unavailable. Please configure GROQ_API_KEY.') }
    finally { setLoadingAI(false) }
  }

  if (loading) return <div className="loading-overlay"><div className="loading-spinner" /></div>
  if (!result) return <div className="empty-state"><p>Result not found</p></div>

  const correct = result.answers.filter(a => a.isCorrect).length
  const wrong = result.answers.filter(a => !a.isCorrect && a.selectedAnswer).length
  const skipped = result.answers.filter(a => !a.selectedAnswer).length
  const pieData = [
    { name: 'Correct', value: correct, color: '#10b981' },
    { name: 'Wrong', value: wrong, color: '#ef4444' },
    { name: 'Skipped', value: skipped, color: '#6b7280' },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{result.exam?.title}</h1>
          <p className="page-subtitle">{result.exam?.subject} · {new Date(result.submittedAt).toLocaleString()}</p>
        </div>
        <Link to="/student/results" className="btn btn-secondary">← Back to Results</Link>
      </div>

      {/* Score Banner */}
      <div className="card" style={{ marginBottom: 20, background: result.isPassed ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', borderColor: result.isPassed ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 48 }}>{result.isPassed ? '🏆' : '📖'}</div>
          <div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 32, fontWeight: 800, color: result.isPassed ? 'var(--green)' : 'var(--red)' }}>{result.percentage}%</div>
            <div style={{ fontSize: 16, color: 'var(--text2)' }}>{result.score} / {result.totalMarks} marks · {result.isPassed ? 'PASSED' : 'FAILED'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {result.rank && <div style={{ textAlign: 'center' }}><div style={{ fontFamily: 'Syne,sans-serif', fontSize: 24, fontWeight: 700 }}>#{result.rank}</div><div style={{ fontSize: 12, color: 'var(--text3)' }}>RANK</div></div>}
          <div style={{ textAlign: 'center' }}><div style={{ fontFamily: 'Syne,sans-serif', fontSize: 24, fontWeight: 700 }}>{Math.floor(result.timeTaken / 60)}m</div><div style={{ fontSize: 12, color: 'var(--text3)' }}>TIME</div></div>
          <div style={{ textAlign: 'center' }}><div style={{ fontFamily: 'Syne,sans-serif', fontSize: 24, fontWeight: 700 }}>{correct}/{result.answers.length}</div><div style={{ fontSize: 12, color: 'var(--text3)' }}>CORRECT</div></div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {['overview', 'answers', 'ai-feedback'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px 20px', background: 'none', border: 'none', color: activeTab === tab ? 'var(--accent)' : 'var(--text2)', fontWeight: activeTab === tab ? 600 : 400, borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent', cursor: 'pointer', fontSize: 14, textTransform: 'capitalize', transition: 'all 0.15s' }}>
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="chart-card">
            <div className="chart-title">Answer Breakdown</div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => value > 0 ? name + ': ' + value : ''}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-card">
            <div className="chart-title">Score Summary</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={[{ name: 'Your Score', value: result.score }, { name: 'Total Marks', value: result.totalMarks }, { name: 'Passing Marks', value: result.exam?.passingMarks || 0 }]}>
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'answers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {result.answers.map((ans, i) => (
            <div key={i} className="card" style={{ borderColor: ans.isCorrect ? 'rgba(16,185,129,0.3)' : ans.selectedAnswer ? 'rgba(239,68,68,0.3)' : 'var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Q{i + 1}. {ans.question?.questionText}</span>
                <span className={'badge ' + (ans.isCorrect ? 'badge-published' : ans.selectedAnswer ? 'badge-closed' : 'badge-draft')}>
                  {ans.isCorrect ? '✓ Correct' : ans.selectedAnswer ? '✗ Wrong' : 'Skipped'} · {ans.marksObtained}/{ans.question?.marks}
                </span>
              </div>
              {ans.question?.options?.map((opt, j) => {
                let cls = 'option-item'
                if (opt === ans.question?.correctAnswer) cls += ' correct'
                else if (opt === ans.selectedAnswer) cls += ' incorrect'
                return <div key={j} className={cls} style={{ cursor: 'default', marginBottom: 6 }}>{opt}</div>
              })}
              {ans.question?.explanation && <div style={{ marginTop: 8, padding: '10px 12px', background: 'rgba(59,130,246,0.08)', borderRadius: 8, fontSize: 13, color: 'var(--blue)' }}>💡 {ans.question.explanation}</div>}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'ai-feedback' && (
        <div className="card">
          <h3 style={{ marginBottom: 16, fontFamily: 'Syne,sans-serif' }}>🤖 AI Performance Feedback</h3>
          {!aiFeedback ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <p style={{ color: 'var(--text2)', marginBottom: 20 }}>Get personalized AI feedback on your performance</p>
              <button className="btn btn-primary" onClick={getAIFeedback} disabled={loadingAI}>
                {loadingAI ? '⏳ Generating...' : '✨ Generate AI Feedback'}
              </button>
            </div>
          ) : (
            <div style={{ padding: '20px', background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 10, lineHeight: 1.7, fontSize: 15, color: 'var(--text)' }}>
              {aiFeedback}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
