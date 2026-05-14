import { useEffect, useState } from 'react'
import api from '../api/axios'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export default function Profile() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', timezone: '', availability: {}
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/api/user/profile/')
      .then(res => {
        setForm({
          first_name: res.data.user.first_name || '',
          last_name: res.data.user.last_name || '',
          timezone: res.data.timezone || 'Asia/Kolkata',
          availability: res.data.availability || {}
        })
        setLoading(false)
      })
      .catch(() => { setError('Failed to load profile'); setLoading(false) })
  }, [])

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function toggleDay(day) {
    setForm(f => {
      const av = { ...f.availability }
      if (av[day]) {
        delete av[day]
      } else {
        av[day] = { from: '09:00', to: '17:00' }
      }
      return { ...f, availability: av }
    })
  }

  function handleTimeChange(day, field, value) {
    setForm(f => ({
      ...f,
      availability: {
        ...f.availability,
        [day]: { ...f.availability[day], [field]: value }
      }
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    setError(null)
    try {
      await api.put('/api/user/profile/', {
        first_name: form.first_name,
        last_name: form.last_name,
        timezone: form.timezone,
        availability: form.availability,
      })
      setSuccess(true)
    } catch {
      setError('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading...</p>

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    background: 'var(--bg)', border: '0.5px solid var(--border)',
    borderRadius: '8px', fontSize: '14px', color: 'var(--text)', outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle = {
    display: 'block', fontSize: '13px',
    color: 'var(--text-muted)', marginBottom: '6px'
  }

  return (
    <div style={{ maxWidth: '700px', margin: '3rem auto', padding: '0 1.5rem' }}>
      <div style={{
        background: 'var(--surface)', border: '0.5px solid var(--border)',
        borderRadius: '12px', padding: '2rem',
      }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)', marginTop: 0, marginBottom: '2rem' }}>
          Edit Profile
        </h1>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>First Name</label>
              <input name="first_name" value={form.first_name} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Last Name</label>
              <input name="last_name" value={form.last_name} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          {/* Timezone */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={labelStyle}>Timezone</label>
            <input name="timezone" value={form.timezone} onChange={handleChange} style={inputStyle} />
          </div>

          {/* Availability */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ ...labelStyle, marginBottom: '1rem' }}>Availability</label>
            {DAYS.map(day => {
              const active = !!form.availability[day]
              return (
                <div key={day} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  marginBottom: '0.75rem', flexWrap: 'wrap',
                }}>
                  <button type="button" onClick={() => toggleDay(day)} style={{
                    width: '110px', padding: '6px 10px', borderRadius: '6px',
                    fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                    background: active ? 'var(--primary)' : 'var(--bg)',
                    color: active ? '#fff' : 'var(--text-muted)',
                    border: '0.5px solid var(--border)',
                    textTransform: 'capitalize',
                  }}>
                    {day}
                  </button>
                  {active && (
                    <>
                      <input
                        type="time"
                        value={form.availability[day].from}
                        onChange={e => handleTimeChange(day, 'from', e.target.value)}
                        style={{ ...inputStyle, width: '140px' }}
                      />
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>to</span>
                      <input
                        type="time"
                        value={form.availability[day].to}
                        onChange={e => handleTimeChange(day, 'to', e.target.value)}
                        style={{ ...inputStyle, width: '140px' }}
                      />
                    </>
                  )}
                </div>
              )
            })}
          </div>

          {error && <p style={{ color: 'red', fontSize: '13px', marginBottom: '1rem' }}>{error}</p>}
          {success && <p style={{ color: 'var(--primary)', fontSize: '13px', marginBottom: '1rem' }}>Profile saved.</p>}

          <button type="submit" disabled={saving} style={{
            background: 'var(--primary)', color: '#fff',
            border: 'none', borderRadius: '8px',
            padding: '10px 24px', fontSize: '14px',
            fontWeight: '500', cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
          }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}