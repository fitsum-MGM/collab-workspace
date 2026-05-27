import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'

const Workspace = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [workspace, setWorkspace] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [docTitle, setDocTitle] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const response = await api.get(`/workspaces/${id}`)
        setWorkspace(response.data)
      } catch (err) {
        console.log('Error fetching workspace:', err)
      }
    }

    const fetchDocuments = async () => {
      try {
        const response = await api.get(`/documents/workspace/${id}`)
        setDocuments(response.data)
      } catch (err) {
        console.log('Error fetching documents:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchWorkspace()
    fetchDocuments()
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

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button
            onClick={() => navigate('/dashboard')}
            style={styles.backBtn}
          >
            ← Back
          </button>
          <h1 style={styles.workspaceName}>
            {workspace?.name || 'Loading...'}
          </h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={styles.createBtn}
        >
          + New Document
        </button>
      </div>

      {/* Documents list */}
      <div style={styles.main}>
        <h2 style={styles.sectionTitle}>Documents</h2>

        {loading ? (
          <p style={styles.loading}>Loading documents...</p>
        ) : documents.length === 0 ? (
          <div style={styles.empty}>
            <p>No documents yet.</p>
            <p>Create your first document!</p>
          </div>
        ) : (
          <div style={styles.list}>
            {documents.map((doc) => (
              <div
                key={doc._id}
                style={styles.docCard}
                onClick={() => navigate(`/document/${doc._id}`)}
              >
                <div style={styles.docIcon}>📄</div>
                <div style={styles.docInfo}>
                  <h3 style={styles.docTitle}>{doc.title}</h3>
                  <p style={styles.docMeta}>
                    Created by {doc.createdBy?.name} ·{' '}
                    {new Date(doc.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={styles.docArrow}>→</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create document modal */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>New Document</h2>
            <form onSubmit={handleCreateDocument}>
              <div style={styles.field}>
                <label style={styles.label}>Document title</label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="Untitled Document"
                  style={styles.input}
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
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  backBtn: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#666'
  },
  workspaceName: {
    fontSize: '18px',
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
  main: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111',
    marginBottom: '1.5rem'
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
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  docCard: {
    backgroundColor: '#fff',
    padding: '1.25rem 1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  docIcon: {
    fontSize: '24px'
  },
  docInfo: {
    flex: 1
  },
  docTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#111',
    marginBottom: '4px'
  },
  docMeta: {
    fontSize: '13px',
    color: '#888'
  },
  docArrow: {
    fontSize: '18px',
    color: '#ccc'
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

export default Workspace