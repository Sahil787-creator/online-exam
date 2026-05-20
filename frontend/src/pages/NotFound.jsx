import { Link } from 'react-router-dom'
export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center', padding: 20 }}>
      <div style={{ fontSize: 80 }}>🔍</div>
      <h1 style={{ fontSize: 48, color: 'var(--accent)' }}>404</h1>
      <h2 style={{ fontSize: 24 }}>Page Not Found</h2>
      <p style={{ color: 'var(--text2)', maxWidth: 400 }}>The page you are looking for does not exist or has been moved.</p>
      <Link to="/" className="btn btn-primary">← Back to Home</Link>
    </div>
  )
}
