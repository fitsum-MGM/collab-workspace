import { io } from 'socket.io-client'

let socketInstance = null

const useSocket = () => {
  const token = localStorage.getItem('token')

  if (!token) {
    return null
  }

  if (!socketInstance) {
    socketInstance = io(
      import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
      {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket']
      }
    )

    socketInstance.on('connect', () => {
      console.log('Socket connected!')
    })

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
    })

    socketInstance.on('connect_error', (err) => {
      console.log('Socket connection error:', err.message)
    })
  }

  return socketInstance
}

export default useSocket