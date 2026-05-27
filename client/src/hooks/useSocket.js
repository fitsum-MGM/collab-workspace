import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

let socketInstance = null

const useSocket = () => {
  const socketRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) return

    if (!socketInstance || !socketInstance.connected) {
      socketInstance = io('http://localhost:5000', {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket']
      })

      socketInstance.on('connect', () => {
        console.log('Socket connected!')
      })

      socketInstance.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason)
      })

      socketInstance.on('connect_error', (err) => {
        console.log('Socket connection error:', err.message)
      })

      socketInstance.on('error', (msg) => {
        console.log('Socket error:', msg)
      })
    }

    socketRef.current = socketInstance

  }, [])

  return socketRef.current
}

export default useSocket