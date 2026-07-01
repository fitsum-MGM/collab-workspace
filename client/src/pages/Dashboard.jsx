import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import useAuthStore from '../store/authStore'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [workspaceName, setWorkspaceName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadWorkspaces = async () => {
      try {
        const response = await api.get('/workspaces')
        if (!cancelled) setWorkspaces(response.data)
      } catch (err) {
        console.log('Error fetching workspaces:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadWorkspaces()

    return () => {
      cancelled = true
    }
  }, [])

  const handleCreateWorkspace = async (e) => {
    e.preventDefault()
    setError('')
    setCreating(true)
    try {
      const response = await api.post('/workspaces', { name: workspaceName })
      setWorkspaces([...workspaces, response.data])
      setWorkspaceName('')
      setShowModal(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setCreating(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444']

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#0F0F0F',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#fff'
    }}>

      {/* Sidebar */}
      <div style={{
        width: sidebarCollapsed ? '64px' : '240px',
        background: '#111111',
        borderRight: '1px solid #1E1E1E',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        flexShrink: 0,
        position: 'relative'
      }}>
        {/* Logo */}
        <div style={{
          padding: sidebarCollapsed ? '20px 14px' : '20px 20px',
          borderBottom: '1px solid #1E1E1E',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            flexShrink: 0
          }}>⚡</div>
          {!sidebarCollapsed && (
            <span style={{ color: '#fff', fontSize: '15px', fontWeight: '600', whiteSpace: 'nowrap' }}>
              CollabSpace
            </span>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {[
            { icon: '⊞', label: 'Dashboard', active: true },
            { icon: '◫', label: 'Workspaces' },
            { icon: '⏱', label: 'Recent' },
            { icon: '⚙', label: 'Settings' }
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                background: item.active ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: item.active ? '#818CF8' : '#666',
                marginBottom: '2px',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={e => {
                if (!item.active) e.currentTarget.style.background = '#1A1A1A'
              }}
              onMouseLeave={e => {
                if (!item.active) e.currentTarget.style.background = 'transparent'
              }}
            >
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{item.icon}</span>
              {!sidebarCollapsed && (
                <span style={{ fontSize: '13px', fontWeight: '500' }}>{item.label}</span>
              )}
            </div>
          ))}
        </nav>

        {/* Collapse button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{
            margin: '8px',
            padding: '8px',
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '8px',
            color: '#666',
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {sidebarCollapsed ? '→' : '←'}
        </button>

        {/* User profile */}
        <div style={{
          padding: '16px 12px',
          borderTop: '1px solid #1E1E1E',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: '600',
            flexShrink: 0
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          {!sidebarCollapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: '500', color: '#fff', margin: 0, truncate: true }}>
                {user?.name}
              </p>
              <button
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  fontSize: '11px',
                  cursor: 'pointer',
                  padding: 0,
                  marginTop: '2px'
                }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'auto' }}>

        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #1E1E1E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#111111'
        }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', margin: 0 }}>
              Good morning, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ color: '#555', fontSize: '13px', margin: '4px 0 0' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            + New Workspace
          </button>
        </div>

        <div style={{ padding: '32px' }}>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            marginBottom: '40px'
          }}>
            {[
              { label: 'Total Workspaces', value: workspaces.length, icon: '◫', color: '#6366F1' },
              { label: 'Active Now', value: '1', icon: '⚡', color: '#10B981' },
              { label: 'Last Updated', value: 'Today', icon: '⏱', color: '#F59E0B' }
            ].map((stat) => (
              <div key={stat.label} style={{
                background: '#111111',
                border: '1px solid #1E1E1E',
                borderRadius: '14px',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  background: `${stat.color}15`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  {stat.icon}
                </div>
                <div>
                  <p style={{ color: '#555', fontSize: '12px', margin: '0 0 4px', fontWeight: '500' }}>
                    {stat.label}
                  </p>
                  <p style={{ color: '#fff', fontSize: '22px', fontWeight: '700', margin: 0 }}>
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Workspaces section */}
          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', margin: 0 }}>
              Your Workspaces
            </h2>
            <span style={{ color: '#555', fontSize: '13px' }}>
              {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {[1,2,3].map(i => (
                <div key={i} style={{
                  background: '#111111',
                  border: '1px solid #1E1E1E',
                  borderRadius: '14px',
                  padding: '24px',
                  height: '140px',
                  animation: 'pulse 1.5s infinite'
                }} />
              ))}
            </div>
          ) : workspaces.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#444'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>◫</div>
              <p style={{ fontSize: '16px', fontWeight: '500', color: '#555', marginBottom: '8px' }}>
                No workspaces yet
              </p>
              <p style={{ fontSize: '14px', color: '#444' }}>
                Create your first workspace to get started
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '16px'
            }}>
              {workspaces.map((workspace, index) => (
                <div
                  key={workspace._id}
                  onClick={() => navigate(`/workspace/${workspace._id}`)}
                  style={{
                    background: '#111111',
                    border: '1px solid #1E1E1E',
                    borderRadius: '14px',
                    padding: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#6366F1'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.15)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#1E1E1E'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* Color accent */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: colors[index % colors.length],
                    borderRadius: '14px 14px 0 0'
                  }} />

                  <div style={{
                    width: '44px',
                    height: '44px',
                    background: `${colors[index % colors.length]}20`,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: '700',
                    color: colors[index % colors.length],
                    marginBottom: '16px'
                  }}>
                    {workspace.name.charAt(0).toUpperCase()}
                  </div>

                  <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', margin: '0 0 6px' }}>
                    {workspace.name}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '500',
                      color: colors[index % colors.length],
                      background: `${colors[index % colors.length]}15`,
                      padding: '3px 8px',
                      borderRadius: '20px',
                      textTransform: 'capitalize'
                    }}>
                      {workspace.role}
                    </span>
                    <span style={{ color: '#444', fontSize: '12px' }}>→</span>
                  </div>
                </div>
              ))}

              {/* New workspace card */}
              <div
                onClick={() => setShowModal(true)}
                style={{
                  background: 'transparent',
                  border: '1px dashed #2A2A2A',
                  borderRadius: '14px',
                  padding: '24px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  minHeight: '140px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#6366F1'
                  e.currentTarget.style.background = 'rgba(99,102,241,0.05)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#2A2A2A'
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  background: '#1A1A1A',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  color: '#444'
                }}>+</div>
                <p style={{ color: '#444', fontSize: '13px', margin: 0 }}>New Workspace</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create workspace modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '16px',
            padding: '32px',
            width: '100%',
            maxWidth: '400px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', margin: '0 0 8px' }}>
              New Workspace
            </h2>
            <p style={{ color: '#555', fontSize: '13px', margin: '0 0 24px' }}>
              Create a space for your team to collaborate
            </p>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#F87171',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '13px',
                marginBottom: '16px'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleCreateWorkspace}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: '#888', fontSize: '13px', display: 'block', marginBottom: '8px' }}>
                  Workspace name
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={e => setWorkspaceName(e.target.value)}
                  placeholder="My Team Workspace"
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    background: '#0F0F0F',
                    border: '1px solid #2A2A2A',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = '#6366F1'}
                  onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: '1px solid #2A2A2A',
                    borderRadius: '10px',
                    padding: '11px',
                    color: '#666',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '11px',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: creating ? 'not-allowed' : 'pointer'
                  }}
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard