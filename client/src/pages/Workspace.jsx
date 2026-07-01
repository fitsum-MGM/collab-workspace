import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import useAuthStore from '../store/authStore'

const Workspace = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [workspace, setWorkspace] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [docTitle, setDocTitle] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!id) return

    let cancelled = false

    const loadWorkspace = async () => {
      try {
        const [workspaceResponse, documentsResponse] = await Promise.all([
          api.get(`/workspaces/${id}`),
          api.get(`/documents/workspace/${id}`)
        ])

        if (cancelled) return

        setWorkspace(workspaceResponse.data)
        setDocuments(documentsResponse.data)
      } catch (err) {
        console.log('Error fetching workspace or documents:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadWorkspace()

    return () => {
      cancelled = true
    }
  }, [id])

  const handleCreateDocument = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      const response = await api.post('/documents', {
        title: docTitle || 'Untitled Document',
        workspaceId: id
      })
      setDocuments([response.data, ...documents])
      setDocTitle('')
      setShowModal(false)
      navigate(`/document/${response.data._id}`)
    } catch (err) {
      console.log('Error creating document:', err)
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteDocument = async (docId, e) => {
    e.stopPropagation()
    if (!window.confirm('Delete this document?')) return
    try {
      await api.delete(`/documents/${docId}`)
      setDocuments(documents.filter(d => d._id !== docId))
    } catch (err) {
      console.log('Error deleting document:', err)
    }
  }

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
        width: '240px',
        background: '#111111',
        borderRight: '1px solid #1E1E1E',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #1E1E1E',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer'
        }}
          onClick={() => navigate('/dashboard')}
        >
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}>⚡</div>
          <span style={{ color: '#fff', fontSize: '15px', fontWeight: '600' }}>CollabSpace</span>
        </div>

        {/* Workspace info */}
        <div style={{ padding: '16px', borderBottom: '1px solid #1E1E1E' }}>
          <p style={{ color: '#444', fontSize: '11px', fontWeight: '500', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Current workspace
          </p>
          <p style={{ color: '#fff', fontSize: '14px', fontWeight: '500', margin: 0 }}>
            {workspace?.name || '...'}
          </p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {[
            { icon: '⊞', label: 'Dashboard', path: '/dashboard' },
            { icon: '◫', label: 'Workspaces', active: true },
            { icon: '⏱', label: 'Recent' },
            { icon: '⚙', label: 'Settings' }
          ].map((item) => (
            <div
              key={item.label}
              onClick={() => item.path && navigate(item.path)}
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
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => {
                if (!item.active) e.currentTarget.style.background = '#1A1A1A'
              }}
              onMouseLeave={e => {
                if (!item.active) e.currentTarget.style.background = 'transparent'
              }}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              <span style={{ fontSize: '13px', fontWeight: '500' }}>{item.label}</span>
            </div>
          ))}
        </nav>

        {/* User */}
        <div style={{
          padding: '16px',
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
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '13px', fontWeight: '500', color: '#fff', margin: 0 }}>
              {user?.name}
            </p>
            <p style={{ fontSize: '11px', color: '#444', margin: '2px 0 0' }}>
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'auto' }}>

        {/* Header */}
        <div style={{
          padding: '20px 32px',
          borderBottom: '1px solid #1E1E1E',
          background: '#111111',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            {/* Breadcrumb */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '6px'
            }}>
              <span
                onClick={() => navigate('/dashboard')}
                style={{ color: '#444', fontSize: '13px', cursor: 'pointer' }}
                onMouseEnter={e => e.target.style.color = '#888'}
                onMouseLeave={e => e.target.style.color = '#444'}
              >
                Dashboard
              </span>
              <span style={{ color: '#333', fontSize: '13px' }}>›</span>
              <span style={{ color: '#888', fontSize: '13px' }}>
                {workspace?.name || '...'}
              </span>
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', margin: 0 }}>
              {workspace?.name || 'Loading...'}
            </h1>
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
            + New Document
          </button>
        </div>

        <div style={{ padding: '32px' }}>

          {/* Stats row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            marginBottom: '32px'
          }}>
            {[
              { label: 'Total Documents', value: documents.length, color: '#6366F1' },
              { label: 'Last Updated', value: documents.length > 0 ? new Date(documents[0]?.updatedAt).toLocaleDateString() : 'N/A', color: '#10B981' },
              { label: 'Your Role', value: workspace?.role || '...', color: '#F59E0B' }
            ].map((stat) => (
              <div key={stat.label} style={{
                background: '#111111',
                border: '1px solid #1E1E1E',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: stat.color,
                  flexShrink: 0
                }} />
                <div>
                  <p style={{ color: '#444', fontSize: '11px', margin: '0 0 3px', fontWeight: '500' }}>
                    {stat.label}
                  </p>
                  <p style={{ color: '#fff', fontSize: '16px', fontWeight: '600', margin: 0, textTransform: 'capitalize' }}>
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Documents */}
          <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', margin: '0 0 16px' }}>
            Documents
          </h2>

          {loading ? (
            <div style={{ color: '#444', fontSize: '14px' }}>Loading documents...</div>
          ) : documents.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              border: '1px dashed #2A2A2A',
              borderRadius: '14px'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📄</div>
              <p style={{ color: '#555', fontSize: '15px', fontWeight: '500', margin: '0 0 6px' }}>
                No documents yet
              </p>
              <p style={{ color: '#444', fontSize: '13px', margin: 0 }}>
                Create your first document to get started
              </p>
            </div>
          ) : (
            <div style={{
              background: '#111111',
              border: '1px solid #1E1E1E',
              borderRadius: '14px',
              overflow: 'hidden'
            }}>
              {/* Table header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 160px 140px 80px',
                padding: '12px 20px',
                borderBottom: '1px solid #1E1E1E',
                gap: '16px'
              }}>
                {['Title', 'Created by', 'Last updated', ''].map(h => (
                  <span key={h} style={{ color: '#444', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {h}
                  </span>
                ))}
              </div>

              {/* Table rows */}
              {documents.map((doc, index) => (
                <div
                  key={doc._id}
                  onClick={() => navigate(`/document/${doc._id}`)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 160px 140px 80px',
                    padding: '14px 20px',
                    borderBottom: index < documents.length - 1 ? '1px solid #1A1A1A' : 'none',
                    gap: '16px',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    alignItems: 'center'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#161616'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Title */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px' }}>📄</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#fff' }}>
                      {doc.title}
                    </span>
                  </div>

                  {/* Author */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: '600',
                      flexShrink: 0
                    }}>
                      {doc.createdBy?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '13px', color: '#666' }}>
                      {doc.createdBy?.name}
                    </span>
                  </div>

                  {/* Date */}
                  <span style={{ fontSize: '13px', color: '#555' }}>
                    {new Date(doc.updatedAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </span>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={(e) => handleDeleteDocument(doc._id, e)}
                      style={{
                        background: 'transparent',
                        border: '1px solid #2A2A2A',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        color: '#EF4444',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create document modal */}
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
              New Document
            </h2>
            <p style={{ color: '#555', fontSize: '13px', margin: '0 0 24px' }}>
              Create a new document in {workspace?.name}
            </p>

            <form onSubmit={handleCreateDocument}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: '#888', fontSize: '13px', display: 'block', marginBottom: '8px' }}>
                  Document title
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                  placeholder="Untitled Document"
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

export default Workspace