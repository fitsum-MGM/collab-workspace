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
  const [wordCount, setWordCount] = useState(0)
  const [editingTitle, setEditingTitle] = useState(false)
  const [sharing, setSharing] = useState(false)

  const debounceTimer = useRef(null)

  const countWords = (text) => {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
  }

  useEffect(() => {
    if (!id) return

    let cancelled = false

    const loadDocument = async () => {
      try {
        const response = await api.get(`/documents/${id}`)
        if (cancelled) return

        setDocument(response.data)
        setTitle(response.data.title || 'Untitled Document')
        const text = response.data.content?.text || ''
        setContent(text)
        setWordCount(countWords(text))
      } catch (err) {
        console.log('Error fetching document:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadDocument()

    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    if (!socket || !id) return

    socket.emit('join-document', { docId: id })

    socket.on('doc-state', ({ content }) => {
      if (content?.text) setContent(content.text)
    })

    socket.on('receive-operation', ({ op }) => {
      if (op?.text !== undefined) setContent(op.text)
    })

    socket.on('user-joined', ({ userId }) => {
      setOnlineUsers(prev => [...new Set([...prev, userId])])
    })

    socket.on('user-left', ({ userId }) => {
      setOnlineUsers(prev => prev.filter(u => u !== userId))
    })

    socket.on('op-ack', () => {
      setSaved(true)
      setSaving(false)
    })

    return () => {
      socket.emit('leave-document', { docId: id })
      socket.off('doc-state')
      socket.off('receive-operation')
      socket.off('user-joined')
      socket.off('user-left')
      socket.off('op-ack')
    }
  }, [socket, id])

  const handleContentChange = useCallback((newContent) => {
    setContent(newContent)
    setWordCount(countWords(newContent))
    setSaved(false)

    if (debounceTimer.current) clearTimeout(debounceTimer.current)

    debounceTimer.current = setTimeout(() => {
      const op = { text: newContent }
      if (socket && socket.connected) {
        setSaving(true)
        socket.emit('send-operation', {
          docId: id,
          op,
          version: document?.version || 0
        })
      }
      api.put(`/documents/${id}`, {
        content: { text: newContent }
      }).catch(console.log)
    }, 500)
  }, [socket, id, document])

  const handleTitleChange = useCallback((newTitle) => {
    setTitle(newTitle)
    setSaved(false)

    if (debounceTimer.current) clearTimeout(debounceTimer.current)

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

  const handleShare = async () => {
    if (!document?.workspace) return

    const email = window.prompt('Enter the email address to share this workspace with')
    if (!email) return

    try {
      setSharing(true)
      await api.post(`/workspaces/${document.workspace}/members`, {
        email,
        role: 'editor'
      })
      window.alert('Workspace shared successfully')
    } catch (err) {
      window.alert(err.response?.data?.message || 'Could not share workspace')
    } finally {
      setSharing(false)
    }
  }

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0F0F0F',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '2px solid #2A2A2A',
            borderTop: '2px solid #6366F1',
            borderRadius: '50%',
            margin: '0 auto 16px',
            animation: 'spin 0.8s linear infinite'
          }} />
          <p style={{ color: '#444', fontSize: '14px' }}>Loading document...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0F0F0F',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        ::placeholder { color: #333; }
        textarea:focus { outline: none; }
      `}</style>

      {/* Top header */}
      <div style={{
        background: '#111111',
        borderBottom: '1px solid #1E1E1E',
        padding: '0 24px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        {/* Left side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'transparent',
              border: '1px solid #2A2A2A',
              borderRadius: '8px',
              padding: '6px 12px',
              color: '#666',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#444'
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#2A2A2A'
              e.currentTarget.style.color = '#666'
            }}
          >
            ← Back
          </button>

          {/* Editable title */}
          {editingTitle ? (
            <input
              type="text"
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              autoFocus
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid #6366F1',
                color: '#fff',
                fontSize: '15px',
                fontWeight: '600',
                outline: 'none',
                padding: '2px 4px',
                minWidth: '200px'
              }}
            />
          ) : (
            <span
              onClick={() => setEditingTitle(true)}
              style={{
                color: '#fff',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'text',
                padding: '2px 4px',
                borderRadius: '4px',
                transition: 'background 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#1A1A1A'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              title="Click to edit title"
            >
              {title}
              <span style={{ color: '#333', fontSize: '12px', marginLeft: '6px' }}>✏</span>
            </span>
          )}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Save status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {saving ? (
              <>
                <div style={{
                  width: '12px',
                  height: '12px',
                  border: '1.5px solid #2A2A2A',
                  borderTop: '1.5px solid #6366F1',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
                <span style={{ color: '#555', fontSize: '12px' }}>Saving...</span>
              </>
            ) : saved ? (
              <>
                <span style={{ color: '#10B981', fontSize: '12px' }}>✓</span>
                <span style={{ color: '#10B981', fontSize: '12px' }}>Saved</span>
              </>
            ) : (
              <span style={{ color: '#555', fontSize: '12px' }}>Unsaved</span>
            )}
          </div>

          {/* Online users */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '-4px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              borderRadius: '50%',
              border: '2px solid #111',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '600',
              title: user?.name
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {onlineUsers.map((userId, index) => (
              <div
                key={index}
                style={{
                  width: '32px',
                  height: '32px',
                  background: ['#10B981', '#F59E0B', '#EF4444'][index % 3],
                  borderRadius: '50%',
                  border: '2px solid #111',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginLeft: '-8px'
                }}
              >
                U
              </div>
            ))}
          </div>

          {/* Share button */}
          <button
            type="button"
            onClick={handleShare}
            disabled={sharing}
            style={{
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '7px 16px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: sharing ? 'not-allowed' : 'pointer',
              opacity: sharing ? 0.75 : 1
            }}
          >
            {sharing ? 'Sharing...' : 'Share'}
          </button>
        </div>
      </div>

      {/* Online presence bar */}
      {onlineUsers.length > 0 && (
        <div style={{
          background: 'rgba(16,185,129,0.08)',
          borderBottom: '1px solid rgba(16,185,129,0.15)',
          padding: '8px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            background: '#10B981',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }} />
          <span style={{ color: '#10B981', fontSize: '13px' }}>
            {onlineUsers.length} other {onlineUsers.length === 1 ? 'person' : 'people'} editing this document
          </span>
        </div>
      )}

      {/* Editor area */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        padding: '40px 24px',
        overflow: 'auto'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '780px'
        }}>
          {/* Document card */}
          <div style={{
            background: '#111111',
            border: '1px solid #1E1E1E',
            borderRadius: '16px',
            padding: '48px 56px',
            minHeight: '600px',
            position: 'relative'
          }}>
            {/* Document title inside editor */}
            <input
              type="text"
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="Untitled Document"
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '28px',
                fontWeight: '700',
                outline: 'none',
                marginBottom: '8px',
                padding: 0,
                boxSizing: 'border-box',
                letterSpacing: '-0.02em'
              }}
            />

            {/* Divider */}
            <div style={{
              height: '1px',
              background: '#1E1E1E',
              margin: '16px 0 24px'
            }} />

            {/* Text area */}
            <textarea
              value={content}
              onChange={e => handleContentChange(e.target.value)}
              placeholder="Start writing your document here..."
              style={{
                width: '100%',
                minHeight: '480px',
                background: 'transparent',
                border: 'none',
                color: '#C8C8C8',
                fontSize: '16px',
                lineHeight: '1.8',
                resize: 'none',
                fontFamily: 'Inter, system-ui, sans-serif',
                padding: 0,
                boxSizing: 'border-box'
              }}
            />

            {/* Bottom bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid #1A1A1A'
            }}>
              <span style={{ color: '#333', fontSize: '12px' }}>
                {wordCount} {wordCount === 1 ? 'word' : 'words'}
              </span>
              <span style={{ color: '#333', fontSize: '12px' }}>
                {content.length} characters
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocumentEditor