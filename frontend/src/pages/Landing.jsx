import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '20%', left: '10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(108,99,255,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ textAlign: 'center', maxWidth: 680, position: 'relative', zIndex: 1 }}>
        <div style={{ width: 72, height: 72, borderRadius: 18, background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 28px', boxShadow: '0 8px 32px rgba(108,99,255,0.4)' }}>🎓</div>
        <h1 style={{ fontSize: 56, fontWeight: 800, marginBottom: 16, lineHeight: 1.1 }}>
          <span style={{ color: 'var(--text)' }}>Exam</span><span style={{ color: 'var(--accent)' }}>Pro</span>
        </h1>
        <p style={{ fontSize: 20, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.6 }}>Online Examination System</p>
        <p style={{ fontSize: 15, color: 'var(--text3)', marginBottom: 40, lineHeight: 1.7 }}>
          A full-stack platform for institutions to conduct digital exams. Supports students, examiners, and admins with AI-powered features.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
          <Link to="/register" className="btn btn-primary btn-lg">Get Started →</Link>
          <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { icon: '👨‍🎓', title: 'Students', desc: 'Take exams, view results & performance analytics' },
            { icon: '👨‍🏫', title: 'Examiners', desc: 'Create exams, manage questions with AI assistance' },
            { icon: '🛠️', title: 'Admins', desc: 'Manage users, approve exams, monitor system' },
          ].map(item => (
            <div key={item.title} className="card" style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, marginBottom: 6 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
