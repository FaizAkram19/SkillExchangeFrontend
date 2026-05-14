import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const linkStyle = ({ isActive }) => ({
    fontSize: '15px',
    fontWeight: '500',
    textDecoration: 'none',
    color: isActive ? 'var(--primary)' : 'var(--text-muted)',
    transition: 'color 0.15s',
  })

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2.5rem', height: '68px',
      background: 'var(--surface)', borderBottom: '0.5px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <span style={{ fontWeight: '700', fontSize: '18px', color: 'var(--text)', letterSpacing: '-0.3px' }}>
        SkillExchange
      </span>

      <div style={{ display: 'flex', gap: '2.5rem' }}>
        <NavLink to="/dashboard" style={linkStyle}>Dashboard</NavLink>
        <NavLink to="/profile" style={linkStyle}>Profile</NavLink>
        <NavLink to="/connections" style={linkStyle}>Connections</NavLink>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => setDark(d => !d)} style={{
          background: 'none', border: '0.5px solid var(--border)',
          borderRadius: '8px', padding: '7px 16px',
          fontSize: '14px', color: 'var(--text-muted)', cursor: 'pointer',
        }}>
          {dark ? 'Light' : 'Dark'}
        </button>
        <button onClick={handleLogout} style={{
          background: 'var(--primary)', color: '#fff',
          border: 'none', borderRadius: '8px',
          padding: '8px 20px', fontSize: '15px',
          fontWeight: '500', cursor: 'pointer',
        }}>
          Logout
        </button>
      </div>
    </nav>
  )
}