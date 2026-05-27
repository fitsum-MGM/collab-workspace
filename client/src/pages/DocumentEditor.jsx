import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import useAuthStore from '../store/authStore'
import useSocket from '../hooks/useSocket'

const DocumentEditor = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const socket = useSocket()

  const [document, setDocument] = useState(null)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(true)
  const [loading, setLoading] = useState(true)
  const [onlineUsers, setOnlineUsers] = useState([])

  const debounceTimer = useRef(null)
  const isRemoteUpdate = useRef(false)

  // Load document when page opens
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await api.get(`/documents/${id}`)
        setDocument(response.data)
        setTitle(response.data.title || 'Untitled Document')
        setContent(response.data.content?.text || '')
      } catch (err) {
        console.log('Error fetching document:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchDocument()
  }, [id])

  // Connect to socket room when document loads
  useEffect(() => {
    if (!socket || !id) return

    // Join the document room
    socket.emit('join-document', { docId: id })

    // Receive document state from server
    socket.on('doc-state', ({ content }) => {
      if (content?.text) {
        isRemoteUpdate.current = true
        setContent(content.text)
      }
    })

    // Receive operations from other users
    socket.on('receive-operation', ({ op }) => {
      if (op?.text !== undefined) {
        isRemoteUpdate.current = true
        setContent(op.text)
      }
    })

    // Other user joined
    socket.on('user-joined', ({ userId }) => {
      setOnlineUsers((prev) => [...new Set([...prev, userId])])
    })

    // Other user left
    socket.on('user-left', ({ userId }) => {
      setOnlineUsers((prev) => prev.filter((u) => u !== userId))
    })

    // Operation confirmed
    socket.on('op-ack', () => {
      setSaved(true)
      setSaving(false)
    })

    // Operation error
    socket.on('op-error', (msg) => {
      console.log('Operation error:', msg)
      setSaving(false)
    })

    return () => {
      socket.emit('leave-document', { docId: id })
      socket.off('doc-state')
      socket.off('receive-operation')
      socket.off('user-joined')
      socket.off('user-left')
      socket.off('op-ack')
      socket.off('op-error')
    }
  }, [socket, id])

  

  // Handle content change with debounce
  const handleContentChange = useCallback((newContent) => {
    setContent(newContent)
    setSaved(false)

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      const op = { text: newContent }

      // Send via socket
      if (socket && socket.connected) {
        setSaving(true)
        socket.emit('send-operation', {
          docId: id,
          op,
          version: document?.version || 0
        })
      }

      // Also save via REST API as backup
      api.put(`/documents/${id}`, {
        content: { text: newContent }
      }).catch(console.log)

    }, 500)
  }, [socket, id, document])

  // Handle title change
  const handleTitleChange = useCallback((newTitle) => {
    setTitle(newTitle)
    setSaved(false)

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        setSaving(true)
        await api.put(`/documents/${id}`, { title: newTitle })
        setSaved(true)
      } catch (err) {
        console.log('Error saving title:', err)
      } finally {
        setSaving(false)
      }
    }, 1000)
  }, [id])

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [])

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <p>Loading document...</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button
            onClick={() => navigate(-1)}
            style={styles.backBtn}
          >
            ← Back
          </button>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            style={styles.titleInput}
            placeholder="Untitled Document"
          />
        </div>
        <div style={styles.headerRight}>
          <span style={styles.saveStatus}>
            {saving ? 'Saving...' : saved ? '✓ Saved' : 'Unsaved'}
          </span>
          <div style={styles.onlineUsers}>
            <div style={styles.userBadge}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {onlineUsers.map((userId, index) => (
              <div
                key={index}
                style={{
                  ...styles.userBadge,
                  backgroundColor: '#10B981'
                }}
              >
                U
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Online indicator */}
      {onlineUsers.length > 0 && (
        <div style={styles.onlineBanner}>
          <span style={styles.greenDot}></span>
          {onlineUsers.length} other user{onlineUsers.length > 1 ? 's' : ''} editing this document
        </div>
      )}

      {/* Editor */}
      <div style={styles.editorWrapper}>
        <div style={styles.editorContainer}>
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            style={styles.editor}
            placeholder="Start writing your document here..."
          />
        </div>
      </div>
    </div>
  )
}

const styles = {
  loadingScreen: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666'
  },
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    backgroundColor: '#fff',
    padding: '0 2rem',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flex: 1
  },
  backBtn: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#666',
    whiteSpace: 'nowrap'
  },
  titleInput: {
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    color: '#111',
    flex: 1,
    padding: '4px 8px',
    borderRadius: '4px',
    backgroundColor: 'transparent'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  saveStatus: {
    fontSize: '13px',
    color: '#888'
  },
  onlineUsers: {
    display: 'flex',
    gap: '4px'
  },
  userBadge: {
    width: '36px',
    height: '36px',
    backgroundColor: '#4F46E5',
    color: '#fff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600'
  },
  onlineBanner: {
    backgroundColor: '#F0FDF4',
    padding: '8px 2rem',
    fontSize: '13px',
    color: '#166534',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  greenDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#22C55E',
    borderRadius: '50%',
    display: 'inline-block'
  },
  editorWrapper: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    padding: '2rem'
  },
  editorContainer: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    width: '100%',
    maxWidth: '800px',
    padding: '2rem'
  },
  editor: {
    width: '100%',
    minHeight: '600px',
    border: 'none',
    fontSize: '16px',
    lineHeight: '1.8',
    color: '#333',
    resize: 'none',
    fontFamily: 'inherit'
  }
}

export default DocumentEditor