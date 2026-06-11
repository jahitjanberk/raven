import React, { useState, useEffect } from 'react'
import { useSettingsStore } from '../store/settingsStore'
import { RavenLogo } from '../components/RavenLogo'
import { BASE_URL } from '../api/client'

const BG     = '#fff'
const BORDER = '#ececee'
const TEXT1  = '#0a0a0b'
const TEXT2  = '#3a3a3f'
const TEXT3  = '#9a9aa0'
const ERROR  = '#dc2626'
const MONO   = "'IBM Plex Mono',ui-monospace,monospace"
const SANS   = "'Helvetica Neue',Helvetica,Arial,sans-serif"

function Spinner() {
  return (
    <span style={{
      display: 'inline-block', width: 14, height: 14,
      border: '1.5px solid rgba(255,255,255,0.35)',
      borderTopColor: '#fff',
      borderRadius: '50%',
      animation: 'spin 0.65s linear infinite',
      verticalAlign: 'middle',
    }} />
  )
}

function Field({
  label, type, value, onChange, placeholder, autoFocus, disabled,
}: {
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoFocus?: boolean
  disabled?: boolean
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{
        display: 'block',
        fontFamily: MONO, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase',
        color: TEXT3, marginBottom: 8,
      }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '11px 14px',
          background: disabled ? '#f8f8fa' : focused ? BG : '#f8f8fa',
          border: `1px solid ${focused ? TEXT1 : BORDER}`,
          color: disabled ? TEXT3 : TEXT1, fontSize: 14,
          fontFamily: SANS,
          outline: 'none',
          transition: 'border-color .15s, background .15s',
          cursor: disabled ? 'not-allowed' : 'text',
        }}
      />
    </div>
  )
}

export function ActivatePage({ onSuccess }: { onSuccess: () => void }) {
  const token = new URLSearchParams(window.location.search).get('token') ?? ''

  const [email,    setEmail]    = useState('')
  const [orgName,  setOrgName]  = useState('Raven')
  const [name,     setName]     = useState('')
  const [initials, setInitials] = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [infoErr,  setInfoErr]  = useState('')

  useEffect(() => {
    if (!token) { setInfoErr('No invite token found in the URL.'); return }
    fetch(`${BASE_URL}/api/auth/invite-info?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then((d: { email?: string; org_name?: string; detail?: string }) => {
        if (d.detail) { setInfoErr(d.detail); return }
        setEmail(d.email ?? '')
        setOrgName(d.org_name ?? 'Raven')
      })
      .catch(() => setInfoErr('Could not load invite details. Is the backend running?'))
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim())    { setError('Name is required.'); return }
    if (!password)       { setError('Password is required.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }

    setLoading(true)
    try {
      const resp = await fetch(`${BASE_URL}/api/auth/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, name: name.trim(), initials: initials.trim() }),
      })
      const data = await resp.json() as { access_token?: string; user_id?: string; name?: string; initials?: string; detail?: string }
      if (!resp.ok) { setError(data.detail ?? 'Activation failed.'); return }

      localStorage.setItem('raven-token', data.access_token!)
      localStorage.setItem('raven-auth', JSON.stringify({
        email,
        userId: data.user_id,
        loggedInAt: new Date().toISOString(),
      }))

      const store = useSettingsStore.getState()
      if (!store.analystName)     store.setAnalystName(data.name ?? '')
      if (!store.analystInitials) store.setAnalystInitials(data.initials ?? '')

      onSuccess()
    } catch {
      setError('Could not reach the server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  if (infoErr) {
    return (
      <div style={{ minHeight: '100vh', background: BG, fontFamily: SANS, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 380, textAlign: 'center', padding: '0 20px' }}>
          <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'center' }}><RavenLogo height={22} forceTheme="light" /></div>
          <div style={{ padding: '14px 18px', border: `1px solid ${ERROR}`, background: '#fef2f2', color: ERROR, fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
            {infoErr}
          </div>
          <a href="/" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: TEXT3 }}>
            ← Back to home
          </a>
        </div>
      </div>
    )
  }

  if (!email) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: MONO, fontSize: 12, color: TEXT3 }}>Loading invite…</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: SANS, WebkitFontSmoothing: 'antialiased', display: 'flex', flexDirection: 'column' }}>

      <header style={{ borderBottom: `1px solid ${BORDER}`, padding: '0 clamp(20px,4vw,48px)', height: 56, display: 'flex', alignItems: 'center' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <RavenLogo height={22} forceTheme="light" />
        </a>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: TEXT3, marginBottom: 10 }}>
              {orgName}
            </div>
            <h1 style={{ fontWeight: 500, fontSize: 26, letterSpacing: '-.02em', color: TEXT1, margin: '0 0 6px' }}>
              Set up your account
            </h1>
            <p style={{ fontSize: 13, color: TEXT2, margin: 0, lineHeight: 1.6 }}>
              You've been invited to join {orgName}. Choose a name and password to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <Field label="Email address" type="email" value={email} onChange={() => {}} disabled />
            <Field label="Full name" type="text" value={name} onChange={setName} placeholder="e.g. J. Smith" autoFocus />
            <Field label="Initials" type="text" value={initials} onChange={setInitials} placeholder="JS" />
            <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="8+ characters" />
            <Field label="Confirm password" type="password" value={confirm} onChange={setConfirm} placeholder="••••••••" />

            {error && (
              <div style={{ padding: '10px 14px', marginBottom: 18, border: `1px solid ${ERROR}`, fontSize: 13, color: ERROR, lineHeight: 1.5, background: '#fef2f2' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading ? TEXT3 : TEXT1,
                border: 'none', color: '#fff',
                fontFamily: MONO, fontSize: 11.5, letterSpacing: '.09em', textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: 'opacity .15s',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '.82' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
            >
              {loading ? <><Spinner /> Creating account…</> : 'Create account →'}
            </button>
          </form>

          <div style={{ marginTop: 24 }}>
            <a href="/login" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: TEXT3, textDecoration: 'none' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = TEXT1 }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = TEXT3 }}>
              Already have an account? Sign in →
            </a>
          </div>

        </div>
      </div>

    </div>
  )
}
