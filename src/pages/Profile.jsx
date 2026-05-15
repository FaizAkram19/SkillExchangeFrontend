import { useEffect, useState } from 'react'
import api from '../api/axios'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const inputStyle = {
  width: '100%', padding: '10px 12px',
  background: 'var(--bg)', border: '0.5px solid var(--border)',
  borderRadius: '8px', fontSize: '14px', color: 'var(--text)', outline: 'none',
  boxSizing: 'border-box',
}
const labelStyle = {
  display: 'block', fontSize: '13px',
  color: 'var(--text-muted)', marginBottom: '6px',
}

// ─── Skills Section ───────────────────────────────────────────────────────────

function SkillsSection({ userSkills, approvedSkills, onAdd, onDelete, addingSkill }) {
  const [skillType, setSkillType]       = useState('o')
  const [selectedId, setSelectedId]     = useState('')
  const [isNew, setIsNew]               = useState(false)
  const [newName, setNewName]           = useState('')
  const [newDesc, setNewDesc]           = useState('')
  const [submitting, setSubmitting]     = useState(false)
  const [newSkillMsg, setNewSkillMsg]   = useState(null) // { type: 'success'|'error', text }

  const offering = userSkills.filter(us => us.skill_type === 'o')
  const seeking  = userSkills.filter(us => us.skill_type === 's')

  function handleSelectChange(e) {
    const val = e.target.value
    if (val === '__new__') {
      setIsNew(true)
      setSelectedId('')
    } else {
      setIsNew(false)
      setSelectedId(val)
    }
  }

  async function handleAdd() {
    if (isNew) {
      if (!newName.trim()) return
      setSubmitting(true)
      setNewSkillMsg(null)
      try {
        await api.post('/api/skills/create/', { name: newName.trim(), description: newDesc.trim() })
        setNewSkillMsg({ type: 'success', text: `"${newName.trim()}" submitted for approval. It will appear in the dropdown once approved.` })
        setNewName('')
        setNewDesc('')
      } catch (err) {
        const msg = err?.response?.data?.name?.[0] ?? 'Failed to submit skill.'
        setNewSkillMsg({ type: 'error', text: msg })
      } finally {
        setSubmitting(false)
      }
    } else {
      if (!selectedId) return
      await onAdd(Number(selectedId), skillType)
      setSelectedId('')
    }
  }

  function SkillBadge({ us }) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '5px 10px', borderRadius: 999,
        background: 'var(--primary-light)',
        border: '0.5px solid var(--border)',
        fontSize: 13,
      }}>
        <span style={{ color: 'var(--text)' }}>{us.skill.name}</span>
        <button
          onClick={() => onDelete(us.id)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: 14, padding: 0,
            lineHeight: 1, display: 'flex', alignItems: 'center',
          }}
        >
          ×
        </button>
      </div>
    )
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)', marginBottom: '1.25rem' }}>
        Skills
      </h2>

      {/* Offering */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={labelStyle}>Offering</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {offering.length === 0
            ? <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>None added yet.</span>
            : offering.map(us => <SkillBadge key={us.id} us={us} />)
          }
        </div>
      </div>

      {/* Seeking */}
      <div style={{ marginBottom: '1.75rem' }}>
        <label style={labelStyle}>Seeking</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {seeking.length === 0
            ? <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>None added yet.</span>
            : seeking.map(us => <SkillBadge key={us.id} us={us} />)
          }
        </div>
      </div>

      {/* Add skill */}
      <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: '1.25rem' }}>
        <label style={labelStyle}>Add a skill</label>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {/* Skill type toggle */}
          <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '0.5px solid var(--border)' }}>
            {['o', 's'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setSkillType(t)}
                style={{
                  padding: '8px 16px', border: 'none', cursor: 'pointer', fontSize: 13,
                  background: skillType === t ? 'var(--primary)' : 'var(--bg)',
                  color: skillType === t ? '#fff' : 'var(--text-muted)',
                  fontWeight: skillType === t ? 600 : 400,
                }}
              >
                {t === 'o' ? 'Offering' : 'Seeking'}
              </button>
            ))}
          </div>

          {/* Dropdown */}
          {!isNew && (
            <select
              value={selectedId}
              onChange={handleSelectChange}
              style={{ ...inputStyle, width: 'auto', flex: 1, minWidth: 180 }}
            >
              <option value="">Select a skill…</option>
              {approvedSkills.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
              <option value="__new__">+ Add new skill</option>
            </select>
          )}

          {/* Add / Cancel buttons */}
          {!isNew && (
            <button
              type="button"
              onClick={handleAdd}
              disabled={!selectedId || addingSkill}
              style={{
                padding: '8px 20px', borderRadius: 8,
                background: 'var(--primary)', color: '#fff',
                border: 'none', cursor: !selectedId || addingSkill ? 'not-allowed' : 'pointer',
                fontSize: 14, fontWeight: 500,
                opacity: !selectedId || addingSkill ? 0.6 : 1,
              }}
            >
              {addingSkill ? 'Adding…' : 'Add'}
            </button>
          )}
        </div>

        {/* New skill form */}
        {isNew && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Skill name"
              style={inputStyle}
            />
            <input
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="Short description (optional)"
              style={inputStyle}
            />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={handleAdd}
                disabled={!newName.trim() || submitting}
                style={{
                  padding: '8px 20px', borderRadius: 8,
                  background: 'var(--primary)', color: '#fff',
                  border: 'none', cursor: !newName.trim() || submitting ? 'not-allowed' : 'pointer',
                  fontSize: 14, fontWeight: 500,
                  opacity: !newName.trim() || submitting ? 0.6 : 1,
                }}
              >
                {submitting ? 'Submitting…' : 'Submit for approval'}
              </button>
              <button
                type="button"
                onClick={() => { setIsNew(false); setNewName(''); setNewDesc(''); setNewSkillMsg(null) }}
                style={{
                  padding: '8px 20px', borderRadius: 8,
                  background: 'transparent', color: 'var(--text-muted)',
                  border: '0.5px solid var(--border)', cursor: 'pointer', fontSize: 14,
                }}
              >
                Cancel
              </button>
            </div>
            {newSkillMsg && (
              <p style={{ fontSize: 13, margin: 0, color: newSkillMsg.type === 'success' ? 'var(--primary)' : 'red' }}>
                {newSkillMsg.text}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Profile() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', timezone: '', availability: {}
  })
  const [userSkills, setUserSkills]       = useState([])
  const [approvedSkills, setApprovedSkills] = useState([])
  const [loading, setLoading]             = useState(true)
  const [saving, setSaving]               = useState(false)
  const [addingSkill, setAddingSkill]     = useState(false)
  const [success, setSuccess]             = useState(false)
  const [error, setError]                 = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/api/user/profile/'),
      api.get('/api/userskills/'),
      api.get('/api/skills/'),
    ]).then(([profileRes, skillsRes, approvedRes]) => {
      setForm({
        first_name:   profileRes.data.user.first_name || '',
        last_name:    profileRes.data.user.last_name  || '',
        timezone:     profileRes.data.timezone        || 'Asia/Kolkata',
        availability: profileRes.data.availability    || {},
      })
      setUserSkills(skillsRes.data)
      setApprovedSkills(approvedRes.data)
      setLoading(false)
    }).catch(() => { setError('Failed to load profile'); setLoading(false) })
  }, [])

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function toggleDay(day) {
    setForm(f => {
      const av = { ...f.availability }
      if (av[day]) { delete av[day] } else { av[day] = { from: '09:00', to: '17:00' } }
      return { ...f, availability: av }
    })
  }

  function handleTimeChange(day, field, value) {
    setForm(f => ({
      ...f,
      availability: { ...f.availability, [day]: { ...f.availability[day], [field]: value } }
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true); setSuccess(false); setError(null)
    try {
      await api.put('/api/user/profile/', {
        first_name:   form.first_name,
        last_name:    form.last_name,
        timezone:     form.timezone,
        availability: form.availability,
      })
      setSuccess(true)
    } catch {
      setError('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  async function handleAddSkill(skillId, skillType) {
    setAddingSkill(true)
    try {
      const res = await api.post('/api/userskills/', { skill: skillId, skill_type: skillType })
      setUserSkills(prev => [...prev, res.data])
    } catch (err) {
      alert(err?.response?.data?.non_field_errors?.[0] ?? 'Could not add skill.')
    } finally {
      setAddingSkill(false)
    }
  }

  async function handleDeleteSkill(id) {
    try {
      await api.delete(`/api/userskills/${id}/`)
      setUserSkills(prev => prev.filter(us => us.id !== id))
    } catch {
      alert('Could not remove skill.')
    }
  }

  if (loading) return <p style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading...</p>

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

          <div style={{ marginBottom: '2rem' }}>
            <label style={labelStyle}>Timezone</label>
            <input name="timezone" value={form.timezone} onChange={handleChange} style={inputStyle} />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ ...labelStyle, marginBottom: '1rem' }}>Availability</label>
            {DAYS.map(day => {
              const active = !!form.availability[day]
              return (
                <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => toggleDay(day)} style={{
                    width: '110px', padding: '6px 10px', borderRadius: '6px',
                    fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                    background: active ? 'var(--primary)' : 'var(--bg)',
                    color: active ? '#fff' : 'var(--text-muted)',
                    border: '0.5px solid var(--border)', textTransform: 'capitalize',
                  }}>
                    {day}
                  </button>
                  {active && (
                    <>
                      <input type="time" value={form.availability[day].from}
                        onChange={e => handleTimeChange(day, 'from', e.target.value)}
                        style={{ ...inputStyle, width: '140px' }} />
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>to</span>
                      <input type="time" value={form.availability[day].to}
                        onChange={e => handleTimeChange(day, 'to', e.target.value)}
                        style={{ ...inputStyle, width: '140px' }} />
                    </>
                  )}
                </div>
              )
            })}
          </div>

          {error   && <p style={{ color: 'red', fontSize: '13px', marginBottom: '1rem' }}>{error}</p>}
          {success && <p style={{ color: 'var(--primary)', fontSize: '13px', marginBottom: '1rem' }}>Profile saved.</p>}

          <button type="submit" disabled={saving} style={{
            background: 'var(--primary)', color: '#fff', border: 'none',
            borderRadius: '8px', padding: '10px 24px', fontSize: '14px',
            fontWeight: '500', cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
          }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <SkillsSection
          userSkills={userSkills}
          approvedSkills={approvedSkills}
          onAdd={handleAddSkill}
          onDelete={handleDeleteSkill}
          addingSkill={addingSkill}
        />
      </div>
    </div>
  )
}