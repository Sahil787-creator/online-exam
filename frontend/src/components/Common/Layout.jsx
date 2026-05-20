import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navConfig = {
  student: [
    { to: '/student', label: 'Dashboard', icon: '🏠', end: true },
    { to: '/student/exams', label: 'Available Exams', icon: '📝' },
    { to: '/student/results', label: 'My Results', icon: '📊' },
  ],
  examiner: [
    { to: '/examiner', label: 'Dashboard', icon: '🏠', end: true },
    { to: '/examiner/exams', label: 'My Exams', icon: '📋' },
    { to: '/examiner/exams/create', label: 'Create Exam', icon: '➕' },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
    { to: '/admin/users', label: 'Users', icon: '👥' },
    { to: '/admin/exams', label: 'All Exams', icon: '📋' },
  ],
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const links = navConfig[user?.role] || []

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 240, background: 'var(--card)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50 }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎓</div>
            <div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15 }}>ExamPro</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Online Exams</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(108,99,255,0.2)', border: '2px solid rgba(108,99,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginBottom: 8 }}>{user?.name?.charAt(0).toUpperCase()}</div>
          <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
          <span className={`badge badge-${user?.role}`} style={{ marginTop: 4 }}>{user?.role}</span>
        </div>
        <nav style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
          {links.map(link => (
            <NavLink key={link.to} to={link.to} end={link.end} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, marginBottom: 2,
              fontSize: 14, fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--accent3)' : 'var(--text2)',
              background: isActive ? 'rgba(108,99,255,0.15)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
              transition: 'all 0.15s',
            })}>
              <span>{link.icon}</span>{link.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>🚪 Logout</button>
        </div>
      </aside>
      <main style={{ flex: 1, marginLeft: 240, minHeight: '100vh' }}>
        <div style={{ padding: '28px 32px', maxWidth: 1200 }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
