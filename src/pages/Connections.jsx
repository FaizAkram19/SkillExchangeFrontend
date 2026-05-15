import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

function getJwtPayload(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

const TABS = ['connections', 'pending', 'sent', 'suggestions']
const TAB_LABELS = {
  connections: 'Connections',
  pending: 'Pending',
  sent: 'Sent',
  suggestions: 'Suggestions',
}

function Avatar({ user, size = 42 }) {
  const initials = (
    (user?.first_name?.[0] ?? '') + (user?.last_name?.[0] ?? '')
  ).toUpperCase() || user?.username?.[0]?.toUpperCase() || '?'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--primary-light)', color: 'var(--primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.36, flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

function ActionBtn({ label, variant, loading, onClick }) {
  const styles = {
    primary: { background: 'var(--primary)', border: '1px solid var(--primary)', color: '#fff' },
    danger:  { background: 'transparent', border: '1px solid #ef4444', color: '#ef4444' },
    ghost:   { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)' },
  }
  return (
    <button onClick={onClick} disabled={loading} style={{
      ...styles[variant], padding: '5px 14px', borderRadius: 7,
      cursor: loading ? 'not-allowed' : 'pointer', fontSize: 13,
      fontWeight: 500, opacity: loading ? 0.55 : 1, whiteSpace: 'nowrap',
    }}>
      {loading ? '…' : label}
    </button>
  )
}

function PlaceholderBtn({ label, icon }) {
  return (
    <button title="Coming soon" style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '5px 12px', borderRadius: 7,
      border: '1px solid var(--border)', background: 'transparent',
      color: 'var(--text-muted)', cursor: 'not-allowed', fontSize: 13, opacity: 0.45,
    }}>
      <span style={{ fontSize: 14 }}>{icon}</span>{label}
    </button>
  )
}

function UserModal({ data, isSuggestion, onClose }) {
  if (!data) return null
  const displayUser  = isSuggestion ? data.user : data
  const displayExtra = isSuggestion ? data : null
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 16, padding: '28px 28px 24px',
        width: '100%', maxWidth: 400,
        display: 'flex', flexDirection: 'column', gap: 18,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar user={displayUser} size={56} />
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 17, color: 'var(--text)' }}>
              {displayUser?.first_name} {displayUser?.last_name}
            </p>
            <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
              @{displayUser?.username}
            </p>
          </div>
        </div>
        {displayExtra?.timezone && (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
            🕐 {displayExtra.timezone}
          </p>
        )}
        {displayExtra?.rating != null && (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
            ⭐ {displayExtra.rating} / 5.0
          </p>
        )}
        <button onClick={onClose} style={{
          marginTop: 4, padding: '8px 0', borderRadius: 8,
          border: '1px solid var(--border)', background: 'transparent',
          color: 'var(--text)', cursor: 'pointer', fontSize: 14,
        }}>
          Close
        </button>
      </div>
    </div>
  )
}

function ConnectionCard({ conn, currentUserId, onExpand, actions }) {
  const other = conn.sender?.id === currentUserId ? conn.receiver : conn.sender
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <Avatar user={other} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: 'var(--text)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {other?.first_name} {other?.last_name}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
          @{other?.username}
        </p>
      </div>
      <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexShrink: 0 }}>
        <ActionBtn label="View" variant="ghost" onClick={() => onExpand(other, false)} />
        {actions(conn)}
      </div>
    </div>
  )
}

function SuggestionCard({ profile, onExpand, onConnect, loading }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <Avatar user={profile.user} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: 'var(--text)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {profile.user?.first_name} {profile.user?.last_name}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
          @{profile.user?.username}
        </p>
      </div>
      <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexShrink: 0 }}>
        <ActionBtn label="View" variant="ghost" onClick={() => onExpand(profile, true)} />
        <ActionBtn label="Connect" variant="primary" loading={loading} onClick={onConnect} />
      </div>
    </div>
  )
}

function Empty({ label }) {
  return (
    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '52px 0', fontSize: 14 }}>
      {label}
    </div>
  )
}

export default function Connections() {
  const { tokens } = useAuth()
  const currentUserId = tokens?.access ? getJwtPayload(tokens.access)?.user_id : null

  const [activeTab, setActiveTab] = useState('connections')
  const [lists, setLists]         = useState({ connections: [], pending: [], sent: [], suggestions: [] })
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [modal, setModal]         = useState(null)
  const [busy, setBusy]           = useState({})

  const setKey = (k, v) => setBusy(prev => ({ ...prev, [k]: v }))

  const fetchAll = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [cons, pend, sent, sugg] = await Promise.all([
        api.get('/api/connections/'),
        api.get('/api/connections/pending/'),
        api.get('/api/connections/sent/'),
        api.get('/api/connections/suggestions/'),
      ])
      setLists({ connections: cons.data, pending: pend.data, sent: sent.data, suggestions: sugg.data })
    } catch {
      setError('Failed to load. Please refresh.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

const handleRespond = async (pk, status) => {
  const k = `respond-${pk}`; setKey(k, true)
  try {
    await api.patch(`/api/connections/${pk}/respond/`, { connectionStatus: status })
    fetchAll()
  }
  catch { alert('Action failed. Try again.') }
  finally { setKey(k, false) }
}

const handleCancel = async (pk) => {
  const k = `cancel-${pk}`; setKey(k, true)
  try {
    await api.delete(`/api/connections/sent/${pk}/cancel/`)
    fetchAll()
  }
  catch { alert('Cancel failed. Try again.') }
  finally { setKey(k, false) }
}

const handleConnect = async (userId) => {
  const k = `send-${userId}`; setKey(k, true)
  try {
    await api.post('/api/connections/request/', { receiver: userId })
    fetchAll()
  }
  catch (err) { alert(err?.response?.data?.non_field_errors?.[0] ?? 'Could not send request.') }
  finally { setKey(k, false) }
}

  const counts = {
    connections: lists.connections.length, pending: lists.pending.length,
    sent: lists.sent.length, suggestions: lists.suggestions.length,
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: 'var(--text)' }}>
        Connections
      </h1>

      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '8px 16px', border: 'none', background: 'transparent',
            borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === tab ? 600 : 400,
            cursor: 'pointer', fontSize: 14, transition: 'all 0.15s',
          }}>
            {TAB_LABELS[tab]}
            {counts[tab] > 0 && (
              <span style={{
                marginLeft: 6, fontSize: 11, fontWeight: 600,
                background: 'var(--primary-light)', color: 'var(--primary)',
                padding: '1px 7px', borderRadius: 999,
              }}>
                {counts[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 52 }}>Loading…</div>}
      {error   && <div style={{ textAlign: 'center', color: '#ef4444', padding: 52 }}>{error}</div>}

      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {activeTab === 'connections' && (
            lists.connections.length === 0 ? <Empty label="No connections yet." />
            : lists.connections.map(conn => (
              <ConnectionCard key={conn.id} conn={conn} currentUserId={currentUserId}
                onExpand={(data, isSuggestion) => setModal({ data, isSuggestion })}
                actions={() => (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <PlaceholderBtn icon="💬" label="Message" />
                    <PlaceholderBtn icon="📹" label="Call" />
                  </div>
                )}
              />
            ))
          )}

          {activeTab === 'pending' && (
            lists.pending.length === 0 ? <Empty label="No pending requests." />
            : lists.pending.map(conn => (
              <ConnectionCard key={conn.id} conn={conn} currentUserId={currentUserId}
                onExpand={(data, isSuggestion) => setModal({ data, isSuggestion })}
                actions={(c) => (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <ActionBtn label="Accept" variant="primary" loading={busy[`respond-${c.id}`]} onClick={() => handleRespond(c.id, 'a')} />
                    <ActionBtn label="Reject"  variant="danger"  loading={busy[`respond-${c.id}`]} onClick={() => handleRespond(c.id, 'r')} />
                  </div>
                )}
              />
            ))
          )}

          {activeTab === 'sent' && (
            lists.sent.length === 0 ? <Empty label="No sent requests." />
            : lists.sent.map(conn => (
              <ConnectionCard key={conn.id} conn={conn} currentUserId={currentUserId}
                onExpand={(data, isSuggestion) => setModal({ data, isSuggestion })}
                actions={(c) => (
                  <ActionBtn label="Cancel" variant="danger" loading={busy[`cancel-${c.id}`]} onClick={() => handleCancel(c.id)} />
                )}
              />
            ))
          )}

          {activeTab === 'suggestions' && (
            lists.suggestions.length === 0 ? <Empty label="No suggestions right now." />
            : lists.suggestions.map(profile => (
              <SuggestionCard key={profile.user?.id} profile={profile}
                onExpand={(data, isSuggestion) => setModal({ data, isSuggestion })}
                loading={busy[`send-${profile.user?.id}`]}
                onConnect={() => handleConnect(profile.user?.id)}
              />
            ))
          )}

        </div>
      )}

      {modal && <UserModal data={modal.data} isSuggestion={modal.isSuggestion} onClose={() => setModal(null)} />}
    </div>
  )
}