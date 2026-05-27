import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import useAuthStore from '../store/authStore'

const DocumentEditor = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(true)
  const [loading, setLoading] = useState(true)

  const debounceTimer = useRef(null)

  // Load document when page opens
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await api.get(`/documents/${id}`)
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

  // Auto save content after user stops typing
  const saveContent = async (newContent) => {
    try {
      setSaving(true)
      await api.put(`/documents/${id}`, {
        content: { text: newContent }
      })
      setSaved(true)
    } catch (err) {
      console.log('Error saving content:', err)
    } finally {
      setSaving(false)
    }
  }

  const saveTitle = async (newTitle) => {
    try {
      setSaving(true)
      await api.put(`/documents/${id}`, {
        title: newTitle
      })
      setSaved(true)
    } catch (err) {
      console.log('Error saving title:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleContentChange = (newContent) => {
    setContent(newContent)
    setSaved(false)

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(async () => {
      await saveContent(newContent)
    }, 1000)
  }

  const handleTitleChange = (newTitle) => {
    setTitle(newTitle)
    setSaved(false)

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(async () => {
      await saveTitle(newTitle)
    }, 1000)
  }

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
          <button onClick={() => navigate(-1)} style={styles.backBtn}>
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
          <div style={styles.saveStatus}>
            {saving ? 'Saving…' : saved ? 'Saved' : 'Unsaved changes'}
          </div>
          <div style={styles.userInfo}>{user?.name}</div>
        </div>
      </div>

      {/* Editor area */}
      <div style={styles.editorWrap}>
        <textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          style={styles.textarea}
          placeholder="Start writing..."
        />
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
    backgroundColor: '#f5f5f5'
  },
  container: {
    minHeight: '100vh',
    backgroundColor: '#fff'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1.5rem',
    height: '64px',
    borderBottom: '1px solid #eee',
    backgroundColor: '#fafafa'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  backBtn: {
    padding: '8px 12px',
    backgroundColor: 'transparent',
    border: '1px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  titleInput: {
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  saveStatus: {
    fontSize: '13px',
    color: '#666'
  },
  userInfo: {
    fontSize: '14px',
    color: '#333'
  },
  editorWrap: {
    padding: '1.5rem',
    maxWidth: '900px',
    margin: '0 auto'
  },
  textarea: {
    width: '100%',
    minHeight: '60vh',
    fontSize: '16px',
    lineHeight: '1.6',
    padding: '1rem',
    border: '1px solid #eee',
    borderRadius: '8px',
    resize: 'vertical'
  }
}

export default DocumentEditor
