import React, { Children } from 'react'
import { createContext, useContext, useState } from 'react'


const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  return (
    <AuthContext.Provider value={{user, setUser, isAuthLoading, setIsAuthLoading}}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext);

export default AuthContext