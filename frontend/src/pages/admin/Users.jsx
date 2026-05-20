import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [actionLoading, setActionLoading] = useState(null)

  const fetchUsers = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (roleFilter) params.set('role', roleFilter)
    api.get('/admin/users?' + params).then(r => setUsers(r.data.data)).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [search, roleFilter])

  const handleToggle = async (id) => {
    setActionLoading(id)
    try {
      const { data } = await api.put('/admin/users/' + id + '/toggle')
      setUsers(users.map(u => u._id === id ? data.data : u))
    } catch (e) { alert(e.response?.data?.message || 'Error') }
    finally { setActionLoading(null) }
  }

  const handleRoleChange = async (id, role) => {
    try {
      const { data } = await api.put('/admin/users/' + id + '/role', { role })
      setUsers(users.map(u => u._id === id ? data.data : u))
    } catch (e) { alert(e.response?.data?.message || 'Error') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this user? This cannot be undone.')) return
    await api.delete('/admin/users/' + id)
    setUsers(users.filter(u => u._id !== id))
  }

  if (loading) return <div className="loading-overlay"><div className="loading-spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management 👥</h1>
          <p className="page-subtitle">{users.length} users registered</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input className="form-control" style={{ maxWidth: 280 }} placeholder="🔍 Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-control" style={{ maxWidth: 160 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="examiner">Examiner</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className="table-wrapper">
        <table>
          <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(108,99,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>{u.name?.charAt(0)}</div>
                    <div><div style={{ fontWeight: 500 }}>{u.name}</div><div style={{ fontSize: 12, color: 'var(--text3)' }}>{u.email}</div></div>
                  </div>
                </td>
                <td>
                  <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)} className="form-control" style={{ padding: '4px 8px', width: 'auto', fontSize: 13 }} disabled={u.role === 'admin'}>
                    <option value="student">Student</option>
                    <option value="examiner">Examiner</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: u.isActive ? 'var(--green)' : 'var(--red)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: u.isActive ? 'var(--green)' : 'var(--red)', display: 'inline-block' }} />
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ color: 'var(--text3)', fontSize: 13 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {u.role !== 'admin' && (
                      <>
                        <button onClick={() => handleToggle(u._id)} className={'btn btn-sm ' + (u.isActive ? 'btn-danger' : 'btn-success')} disabled={actionLoading === u._id}>
                          {u.isActive ? '🔒 Deactivate' : '🔓 Activate'}
                        </button>
                        <button onClick={() => handleDelete(u._id)} className="btn btn-sm btn-danger">🗑️</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {users.length === 0 && <div className="empty-state"><span style={{ fontSize: 48 }}>👥</span><p>No users found</p></div>}
    </div>
  )
}
