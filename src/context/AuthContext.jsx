import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [tokens, setTokens] = useState(() => {
    const stored = localStorage.getItem('tokens')
    return stored ? JSON.parse(stored) : null
  })

  const login = (tokenData) => {
    setTokens(tokenData)
    localStorage.setItem('tokens', JSON.stringify(tokenData))
  }

  const logout = () => {
    setTokens(null)
    localStorage.removeItem('tokens')
  }

  return (
    <AuthContext.Provider value={{ tokens, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}