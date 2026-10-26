import { createContext, useContext, useEffect, } from 'react';
import { socket } from '../socket/socket';
import { useAuth } from '../hooks/useAuth';


const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, isAuthLoading } = useAuth();

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      if (socket.connected) {
        socket.disconnect();
      }
      return;
    }

    /*
     * ========================================
     * SOCKET EVENTS
     * ========================================
     */
    const handleConnect = () => {
      console.log("🔌 ORBIT Socket connected:", socket.id);
    }

    const handleReady = (payload) => {
      console.log("✅ ORBIT Socket authenticated:", payload);
    }

    const handleConnectError = (error) => {
      console.error("❌ ORBIT Socket connection error:", error.message);
    }

    const handleDisconnect = (reason) => {
      console.log("🔌 ORBIT Socket disconnected:", reason);
    }

    socket.on("connect", handleConnect);
    socket.on("socket:ready", handleReady);
    socket.on("connect_error", handleConnectError);
    socket.on("disconnect", handleDisconnect);

    /*
     * Connect only after authentication
     * has successfully resolved.
     */
    socket.connect();

    /*
     * Cleanup listeners.
     *
     * Very important with React StrictMode
     * and during provider remounts.
     */

    return () => {
      socket.off("connect", handleConnect);
      socket.off("socket:ready", handleReady);
      socket.off("connect_error", handleConnectError);
      socket.off("disconnect", handleDisconnect)
    };
  }, [user, isAuthLoading]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  )
}

export const useSocket = () => {
  const socket = useContext(SocketContext);

  if(!socket){
    throw new Error("useSocket must be used inside SocketProvider")
  }

  return socket;
}

export default SocketContext;