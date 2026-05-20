import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import api from '../../services/api'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats').then(r => setData(r.data.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-overlay"><div className="loading-spinner" /></div>

  const chartData = (data?.monthlyResults || []).map(m => ({
    name: MONTHS[m._id.month - 1],
    submissions: m.count,
    avgScore: Math.round(m.avgScore || 0),
  }))

  const stats = data?.stats || {}

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard 🛠️</h1>
          <p className="page-subtitle">System overview and analytics</p>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#3b82f6' },
          { label: 'Students', value: stats.totalStudents, icon: '👨‍🎓', color: '#10b981' },
          { label: 'Examiners', value: stats.totalExaminers, icon: '👨‍🏫', color: '#a78bfa' },
          { label: 'Total Exams', value: stats.totalExams, icon: '📋', color: '#f59e0b' },
          { label: 'Published', value: stats.publishedExams, icon: '✅', color: '#10b981' },
          { label: 'Pending', value: stats.pendingExams, icon: '⏳', color: '#ef4444' },
          { label: 'Submissions', value: stats.totalResults, icon: '📝', color: '#6c63ff' },
          { label: 'Pass Rate', value: stats.passPercentage + '%', icon: '🎯', color: '#10b981' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.color + '20' }}>{s.icon}</div>
            <div className="stat-info"><div className="stat-value">{s.value ?? '-'}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="chart-card">
          <div className="chart-title">Monthly Submissions</div>
          {chartData.length === 0 ? <div style={{ color: 'var(--text3)', fontSize: 14, textAlign: 'center', padding: 32 }}>No data yet</div> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text3)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--text3)', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Bar dataKey="submissions" fill="var(--accent)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="chart-card">
          <div className="chart-title">Average Score Trend</div>
          {chartData.length === 0 ? <div style={{ color: 'var(--text3)', fontSize: 14, textAlign: 'center', padding: 32 }}>No data yet</div> : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text3)', fontSize: 12 }} />
                <YAxis domain={[0,100]} tick={{ fill: 'var(--text3)', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Line type="monotone" dataKey="avgScore" stroke="var(--green)" strokeWidth={2} dot={{ fill: 'var(--green)' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'Syne,sans-serif' }}>Recent Users</h3>
            <Link to="/admin/users" style={{ fontSize: 13, color: 'var(--accent)' }}>View all →</Link>
          </div>
          {(data?.recentUsers || []).map(u => (
            <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(108,99,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{u.name?.charAt(0)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{u.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{u.email}</div>
              </div>
              <span className={'badge badge-' + u.role}>{u.role}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'Syne,sans-serif' }}>Recent Exams</h3>
            <Link to="/admin/exams" style={{ fontSize: 13, color: 'var(--accent)' }}>View all →</Link>
          </div>
          {(data?.recentExams || []).map(e => (
            <div key={e._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{e.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>by {e.createdBy?.name}</div>
              </div>
              <span className={'badge badge-' + (e.status === 'published' ? 'published' : e.status === 'pending_approval' ? 'pending' : 'draft')}>{e.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
