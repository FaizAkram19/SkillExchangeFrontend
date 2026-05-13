import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

export default function Register() {
  const [form, setForm] = useState({ username: '', first_name: '', last_name: '', email: '', password: '', password2: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const refs = {
    username: useRef(),
    first_name: useRef(),
    last_name: useRef(),
    email: useRef(),
    password: useRef(),
    password2: useRef(),
  }

  const fieldOrder = ['username', 'first_name', 'last_name', 'email', 'password', 'password2']

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password2) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.post('/api/users/', {
        username: form.username,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
      })
      navigate('/login')
    } catch (err) {
      const data = err.response?.data
      const first = data ? Object.values(data)[0] : null
      setError(Array.isArray(first) ? first[0] : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e, name) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const next = fieldOrder[fieldOrder.indexOf(name) + 1]
      if (next) {
        refs[next].current.focus()
      } else {
        handleSubmit(e)
      }
    }
  }

  const fields = [
    { name: 'username', label: 'Username', type: 'text' },
    { name: 'first_name', label: 'First name', type: 'text' },
    { name: 'last_name', label: 'Last name', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'password', label: 'Password', type: 'password' },
    { name: 'password2', label: 'Confirm password', type: 'password' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '500', color: 'var(--text)', marginBottom: '0.25rem' }}>Create account</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Join SkillExchange</p>

        {error && (
          <div style={{ background: '#fef2f2', border: '0.5px solid #fecaca', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', fontSize: '14px', color: '#dc2626' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {fields.map(field => (
            <div key={field.name} style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>{field.label}</label>
              <input
                ref={refs[field.name]}
                name={field.name}
                type={field.type}
                value={form[field.name]}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, field.name)}
                style={{ width: '100%', padding: '10px 12px', background: 'var(--bg)', border: '0.5px solid var(--border)', borderRadius: '8px', fontSize: '14px', color: 'var(--text)', outline: 'none' }}
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '10px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '0.5rem' }}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '13px', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}