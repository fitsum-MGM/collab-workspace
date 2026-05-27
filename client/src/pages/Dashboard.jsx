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

  // Get all workspaces when page loads
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await api.get('/workspaces')
        setWorkspaces(response.data)
      } catch (err) {
        console.log('Error fetching workspaces:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchWorkspaces()
  }, [])

  const handleCreateWorkspace = async (e) => {
    e.preventDefault()
    setError('')
    setCreating(true)

    try {
      const response = await api.post('/workspaces', {
        name: workspaceName
      })
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

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.logo}>CollabSpace</h1>
        <div style={styles.headerRight}>
          <span style={styles.userName}>Hi, {user?.name}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={styles.main}>
        <div style={styles.titleRow}>
          <h2 style={styles.pageTitle}>Your Workspaces</h2>
          <button
            onClick={() => setShowModal(true)}
            style={styles.createBtn}
          >
            + New Workspace
          </button>
        </div>

        {loading ? (
          <p style={styles.loading}>Loading workspaces...</p>
        ) : workspaces.length === 0 ? (
          <div style={styles.empty}>
            <p>You have no workspaces yet.</p>
            <p>Create one to get started!</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {workspaces.map((workspace) => (
              <div
                key={workspace._id}
                style={styles.card}
                onClick={() => navigate(`/workspace/${workspace._id}`)}
              >
                <div style={styles.cardIcon}>
                  {workspace.name.charAt(0).toUpperCase()}
                </div>
                <h3 style={styles.cardTitle}>{workspace.name}</h3>
                <p style={styles.cardRole}>{workspace.role}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create workspace modal */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Create Workspace</h2>

            {error && <div style={styles.error}>{error}</div>}

            <form onSubmit={handleCreateWorkspace}>
              <div style={styles.field}>
                <label style={styles.label}>Workspace name</label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="My Team Workspace"
                  style={styles.input}
                  required
                  autoFocus
                />
              </div>
              <div style={styles.modalButtons}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.createBtn}
                  disabled={creating}
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

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: '#fff',
    padding: '0 2rem',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  logo: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#4F46E5'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  userName: {
    fontSize: '14px',
    color: '#666'
  },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#666'
  },
  main: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '2rem'
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '2rem'
  },
  pageTitle: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#111'
  },
  createBtn: {
    padding: '10px 20px',
    backgroundColor: '#4F46E5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500'
  },
  loading: {
    color: '#666',
    fontSize: '15px'
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    fontSize: '15px',
    marginTop: '4rem',
    lineHeight: '2'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1.5rem'
  },
  card: {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  },
  cardIcon: {
    width: '48px',
    height: '48px',
    backgroundColor: '#EEF2FF',
    color: '#4F46E5',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    fontWeight: '700',
    marginBottom: '1rem'
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111',
    marginBottom: '4px'
  },
  cardRole: {
    fontSize: '13px',
    color: '#888',
    textTransform: 'capitalize'
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '400px'
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '1.5rem',
    color: '#111'
  },
  error: {
    backgroundColor: '#fff0f0',
    color: '#e53e3e',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontSize: '14px'
  },
  field: {
    marginBottom: '1.25rem'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '6px',
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#333'
  },
  modalButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end'
  },
  cancelBtn: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#666'
  }
}

export default Dashboard