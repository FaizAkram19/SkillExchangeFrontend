import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function Dashboard() {
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/api/user/profile/')
      .then(res => setProfile(res.data))
      .catch(() => setError('Failed to load profile'))
  }, [])

  if (error) return <p style={{ padding: '2rem', color: 'red' }}>{error}</p>
  if (!profile) return <p style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading...</p>

  return (
    <div style={{ maxWidth: '700px', margin: '3rem auto', padding: '0 1.5rem' }}>
      <div style={{
        background: 'var(--surface)', border: '0.5px solid var(--border)',
        borderRadius: '12px', padding: '2rem',
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text)', margin: 0 }}>
            {profile.user.first_name} {profile.user.last_name}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            @{profile.user.username}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{
            flex: 1, background: 'var(--bg)', borderRadius: '8px',
            padding: '1rem', border: '0.5px solid var(--border)',
          }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 6px' }}>OFFERING</p>
            {profile.skills_offering?.length
              ? profile.skills_offering.map(s => (
                <span key={s.id} style={{
                  display: 'inline-block', background: 'var(--primary)',
                  color: '#fff', borderRadius: '4px', fontSize: '12px',
                  padding: '2px 8px', marginRight: '6px', marginBottom: '6px',
                }}>{s.skill.name}</span>
              ))
              : <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>None added</p>
            }
          </div>

          <div style={{
            flex: 1, background: 'var(--bg)', borderRadius: '8px',
            padding: '1rem', border: '0.5px solid var(--border)',
          }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 6px' }}>SEEKING</p>
            {profile.skills_seeking?.length
              ? profile.skills_seeking.map(s => (
                <span key={s.id} style={{
                  display: 'inline-block', border: '0.5px solid var(--primary)',
                  color: 'var(--primary)', borderRadius: '4px', fontSize: '12px',
                  padding: '2px 8px', marginRight: '6px', marginBottom: '6px',
                }}>{s.skill.name}</span>
              ))
              : <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>None added</p>
            }
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Rating: <strong style={{ color: 'var(--text)' }}>
              {profile.rating ?? 'Unrated'}
            </strong>
          </p>
          <button onClick={() => navigate('/profile')} style={{
            background: 'var(--primary)', color: '#fff',
            border: 'none', borderRadius: '8px',
            padding: '8px 20px', fontSize: '14px',
            fontWeight: '500', cursor: 'pointer',
          }}>
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  )
}