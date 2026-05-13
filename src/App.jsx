import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<div>Login page</div>} />
          <Route path="/register" element={<div>Register page</div>} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
          <Route path="/profile" element={<div>Profile</div>} />
          <Route path="/connections" element={<div>Connections</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App