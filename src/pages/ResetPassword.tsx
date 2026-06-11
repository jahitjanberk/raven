import React, { useState } from 'react'
import { RavenLogo } from '../components/RavenLogo'
import { BASE_URL } from '../api/client'

const BG     = '#fff'
const BORDER = '#ececee'
const TEXT1  = '#0a0a0b'
const TEXT3  = '#9a9aa0'
const ERROR  = '#dc2626'
const GREEN  = '#16a34a'
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

export function ResetPasswordPage() {
  const token = new URLSearchParams(window.location.search).get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [done,     setDone]     = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!password)            { setError('Password is required.'); return }
    if (password.length < 8)  { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm)  { setError('Passwords do not match.'); return }

    setLoading(true)
    try {
      const resp = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password }),
      })
      const data = await resp.json() as { message?: string; detail?: string }
      if (!resp.ok) { setError(data.detail ?? 'Reset failed. The link may have expired.'); return }
      setDone(true)
    } catch {
      setError('Could not reach the server. Is the backend running?')
    } finally {
      setLoading(false)
    }
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

          {done ? (
            <div>
              <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: TEXT3, marginBottom: 14 }}>
                Raven Intelligence Platform
              </div>
              <h1 style={{ fontWeight: 500, fontSize: 26, letterSpacing: '-.02em', color: TEXT1, margin: '0 0 12px' }}>
                Password updated
              </h1>
              <div style={{ padding: '12px 14px', border: `1px solid ${GREEN}`, background: '#f0fdf4', color: GREEN, fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
                Your password has been changed. You can now sign in with your new password.
              </div>
              <a
                href="/app"
                style={{
                  display: 'block', width: '100%', padding: '13px', boxSizing: 'border-box',
                  background: TEXT1, color: '#fff', textDecoration: 'none', textAlign: 'center',
                  fontFamily: MONO, fontSize: 11.5, letterSpacing: '.09em', textTransform: 'uppercase',
                }}
              >
                Sign in →
              </a>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: TEXT3, marginBottom: 14 }}>
                  Raven Intelligence Platform
                </div>
                <h1 style={{ fontWeight: 500, fontSize: 26, letterSpacing: '-.02em', color: TEXT1, margin: 0 }}>
                  Set a new password
                </h1>
              </div>

              {!token && (
                <div style={{ padding: '10px 14px', marginBottom: 18, border: `1px solid ${ERROR}`, fontSize: 13, color: ERROR, background: '#fef2f2' }}>
                  No reset token found in the URL. Use the link from your email.
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <Field label="New password" type="password" value={password} onChange={setPassword} placeholder="8+ characters" autoFocus />
                <Field label="Confirm password" type="password" value={confirm} onChange={setConfirm} placeholder="••••••••" />

                {error && (
                  <div style={{ padding: '10px 14px', marginBottom: 18, border: `1px solid ${ERROR}`, fontSize: 13, color: ERROR, lineHeight: 1.5, background: '#fef2f2' }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !token}
                  style={{
                    width: '100%', padding: '13px',
                    background: loading || !token ? TEXT3 : TEXT1,
                    border: 'none', color: '#fff',
                    fontFamily: MONO, fontSize: 11.5, letterSpacing: '.09em', textTransform: 'uppercase',
                    cursor: loading || !token ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    transition: 'opacity .15s',
                  }}
                  onMouseEnter={e => { if (!loading && token) e.currentTarget.style.opacity = '.82' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                >
                  {loading ? <><Spinner /> Updating…</> : 'Update password →'}
                </button>
              </form>

              <div style={{ marginTop: 24 }}>
                <a href="/app" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: TEXT3, textDecoration: 'none' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = TEXT1 }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = TEXT3 }}>
                  ← Back to sign in
                </a>
              </div>
            </>
          )}

        </div>
      </div>

    </div>
  )
}
