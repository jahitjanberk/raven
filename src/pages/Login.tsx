import React, { useState } from 'react'
import { useSettingsStore } from '../store/settingsStore'
import { RavenLogo } from '../components/RavenLogo'
import { BASE_URL } from '../api/client'

const BG     = '#fff'
const BORDER = '#ececee'
const TEXT1  = '#0a0a0b'
const TEXT2  = '#3a3a3f'
const TEXT3  = '#9a9aa0'
const ERROR  = '#dc2626'
const GREEN  = '#16a34a'
const MONO   = "'IBM Plex Mono',ui-monospace,monospace"
const SANS   = "'Helvetica Neue',Helvetica,Arial,sans-serif"

type View = 'login' | 'forgot' | 'forgot-sent' | 'request' | 'request-sent'

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
  label, type, value, onChange, placeholder, autoFocus,
}: {
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoFocus?: boolean
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
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '11px 14px',
          background: focused ? BG : '#f8f8fa',
          border: `1px solid ${focused ? TEXT1 : BORDER}`,
          color: TEXT1, fontSize: 14,
          fontFamily: SANS,
          outline: 'none',
          transition: 'border-color .15s, background .15s',
        }}
      />
    </div>
  )
}

// ── Login view ────────────────────────────────────────────────────────────────

function LoginView({ onSuccess, onBack, setView }: {
  onSuccess: () => void
  onBack: () => void
  setView: (v: View) => void
}) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim())        { setError('Email address is required.'); return }
    if (!email.includes('@')) { setError('Enter a valid email address.'); return }
    if (!password)            { setError('Password is required.'); return }

    setLoading(true)
    try {
      const resp = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({})) as { detail?: string }
        setError(body.detail ?? 'Sign in failed. Check your email and password.')
        return
      }

      const data = await resp.json() as { access_token: string; user_id: string; name: string; initials: string }
      localStorage.setItem('raven-token', data.access_token)
      localStorage.setItem('raven-auth', JSON.stringify({
        email: email.trim(),
        userId: data.user_id,
        loggedInAt: new Date().toISOString(),
      }))

      const store = useSettingsStore.getState()
      if (!store.analystName)     store.setAnalystName(data.name)
      if (!store.analystInitials) store.setAnalystInitials(data.initials)

      onSuccess()
    } catch {
      setError('Could not reach the server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: TEXT3, marginBottom: 14 }}>
          Raven Intelligence Platform
        </div>
        <h1 style={{ fontWeight: 500, fontSize: 28, letterSpacing: '-.02em', color: TEXT1, margin: 0 }}>
          Sign in
        </h1>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <Field label="Email address" type="email" value={email} onChange={setEmail} placeholder="analyst@example.gov" autoFocus />
        <div style={{ position: 'relative' }}>
          <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
          <button
            type="button"
            onClick={() => setView('forgot')}
            style={{
              position: 'absolute', top: 0, right: 0,
              fontFamily: MONO, fontSize: 9.5, letterSpacing: '.08em', textTransform: 'uppercase',
              color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = TEXT1 }}
            onMouseLeave={e => { e.currentTarget.style.color = TEXT3 }}
          >
            Forgot?
          </button>
        </div>

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
          {loading ? <><Spinner /> Signing in…</> : 'Sign in →'}
        </button>
      </form>

      <div style={{ marginTop: 20, padding: '12px 14px', border: `1px solid ${BORDER}`, background: '#f8f8fa', fontSize: 12.5, color: TEXT3, lineHeight: 1.6, fontFamily: MONO }}>
        <span style={{ color: TEXT2 }}>Demo</span> — demo@raven.app / demo1234
      </div>

      <div style={{ marginTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={onBack}
          style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          onMouseEnter={e => { e.currentTarget.style.color = TEXT1 }}
          onMouseLeave={e => { e.currentTarget.style.color = TEXT3 }}
        >
          ← Back
        </button>
        <button
          onClick={() => setView('request')}
          style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          onMouseEnter={e => { e.currentTarget.style.color = TEXT1 }}
          onMouseLeave={e => { e.currentTarget.style.color = TEXT3 }}
        >
          Request access →
        </button>
      </div>
    </>
  )
}

// ── Forgot password view ──────────────────────────────────────────────────────

function ForgotView({ setView }: { setView: (v: View) => void }) {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !email.includes('@')) { setError('Enter a valid email address.'); return }

    setLoading(true)
    try {
      await fetch(`${BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      setView('forgot-sent')
    } catch {
      setError('Could not reach the server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: TEXT3, marginBottom: 14 }}>
          Raven Intelligence Platform
        </div>
        <h1 style={{ fontWeight: 500, fontSize: 26, letterSpacing: '-.02em', color: TEXT1, margin: '0 0 8px' }}>
          Reset password
        </h1>
        <p style={{ fontSize: 13, color: TEXT2, margin: 0, lineHeight: 1.6 }}>
          Enter your email and we'll send a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <Field label="Email address" type="email" value={email} onChange={setEmail} placeholder="analyst@example.gov" autoFocus />

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
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '.82' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
        >
          {loading ? <><Spinner /> Sending…</> : 'Send reset link →'}
        </button>
      </form>

      <div style={{ marginTop: 24 }}>
        <button
          onClick={() => setView('login')}
          style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          onMouseEnter={e => { e.currentTarget.style.color = TEXT1 }}
          onMouseLeave={e => { e.currentTarget.style.color = TEXT3 }}
        >
          ← Back to sign in
        </button>
      </div>
    </>
  )
}

// ── Forgot-sent confirmation ──────────────────────────────────────────────────

function ForgotSentView({ setView }: { setView: (v: View) => void }) {
  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: TEXT3, marginBottom: 14 }}>
          Raven Intelligence Platform
        </div>
        <h1 style={{ fontWeight: 500, fontSize: 26, letterSpacing: '-.02em', color: TEXT1, margin: '0 0 8px' }}>
          Check your email
        </h1>
      </div>
      <div style={{ padding: '12px 14px', border: `1px solid ${GREEN}`, background: '#f0fdf4', color: GREEN, fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
        If that email is registered, a reset link is on its way. Check your inbox and spam folder.
      </div>
      <button
        onClick={() => setView('login')}
        style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        onMouseEnter={e => { e.currentTarget.style.color = TEXT1 }}
        onMouseLeave={e => { e.currentTarget.style.color = TEXT3 }}
      >
        ← Back to sign in
      </button>
    </>
  )
}

// ── Request access view ───────────────────────────────────────────────────────

function RequestView({ setView }: { setView: (v: View) => void }) {
  const [email,   setEmail]   = useState('')
  const [name,    setName]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !email.includes('@')) { setError('Enter a valid email address.'); return }

    setLoading(true)
    try {
      const resp = await fetch(`${BASE_URL}/api/auth/request-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: name.trim() }),
      })
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({})) as { detail?: string }
        setError(body.detail ?? 'Request failed. Please try again.')
        return
      }
      setView('request-sent')
    } catch {
      setError('Could not reach the server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: TEXT3, marginBottom: 14 }}>
          Raven Intelligence Platform
        </div>
        <h1 style={{ fontWeight: 500, fontSize: 26, letterSpacing: '-.02em', color: TEXT1, margin: '0 0 8px' }}>
          Request access
        </h1>
        <p style={{ fontSize: 13, color: TEXT2, margin: 0, lineHeight: 1.6 }}>
          Submit your email and we'll send you an invite link.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <Field label="Email address" type="email" value={email} onChange={setEmail} placeholder="analyst@example.gov" autoFocus />
        <Field label="Full name (optional)" type="text" value={name} onChange={setName} placeholder="J. Smith" />

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
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '.82' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
        >
          {loading ? <><Spinner /> Sending…</> : 'Request access →'}
        </button>
      </form>

      <div style={{ marginTop: 24 }}>
        <button
          onClick={() => setView('login')}
          style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          onMouseEnter={e => { e.currentTarget.style.color = TEXT1 }}
          onMouseLeave={e => { e.currentTarget.style.color = TEXT3 }}
        >
          ← Back to sign in
        </button>
      </div>
    </>
  )
}

// ── Request-sent confirmation ─────────────────────────────────────────────────

function RequestSentView({ setView }: { setView: (v: View) => void }) {
  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: TEXT3, marginBottom: 14 }}>
          Raven Intelligence Platform
        </div>
        <h1 style={{ fontWeight: 500, fontSize: 26, letterSpacing: '-.02em', color: TEXT1, margin: '0 0 8px' }}>
          Request received
        </h1>
      </div>
      <div style={{ padding: '12px 14px', border: `1px solid ${GREEN}`, background: '#f0fdf4', color: GREEN, fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
        Check your email for an access link. It may take a moment to arrive.
      </div>
      <button
        onClick={() => setView('login')}
        style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        onMouseEnter={e => { e.currentTarget.style.color = TEXT1 }}
        onMouseLeave={e => { e.currentTarget.style.color = TEXT3 }}
      >
        ← Back to sign in
      </button>
    </>
  )
}

// ── Page shell ────────────────────────────────────────────────────────────────

export function LoginPage({
  onSuccess,
  onBack,
}: {
  onSuccess: () => void
  onBack: () => void
}) {
  const [view, setView] = useState<View>('login')

  return (
    <div style={{
      minHeight: '100vh', background: BG,
      fontFamily: SANS, WebkitFontSmoothing: 'antialiased',
      display: 'flex', flexDirection: 'column',
    }}>

      <header style={{ borderBottom: `1px solid ${BORDER}`, padding: '0 clamp(20px,4vw,48px)', height: 56, display: 'flex', alignItems: 'center' }}>
        <button
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <RavenLogo height={22} forceTheme="light" />
        </button>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          {view === 'login'        && <LoginView onSuccess={onSuccess} onBack={onBack} setView={setView} />}
          {view === 'forgot'       && <ForgotView setView={setView} />}
          {view === 'forgot-sent'  && <ForgotSentView setView={setView} />}
          {view === 'request'      && <RequestView setView={setView} />}
          {view === 'request-sent' && <RequestSentView setView={setView} />}
        </div>
      </div>

    </div>
  )
}
