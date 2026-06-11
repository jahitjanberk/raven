import React, { useState } from 'react'
import { useSettingsStore } from '../store/settingsStore'
import { useTheme } from '../context/ThemeContext'
import { UIIcon } from '../icons/UIIcon'
import { useIsMobile } from '../hooks/useBreakpoint'
import type { Classification, InvestigationType } from '../types/project'
import { RavenLogo } from '../components/RavenLogo'

const CLASSIFICATIONS: Classification[] = ['OFFICIAL', 'OFFICIAL-SENSITIVE', 'CUSTOM']
const INVESTIGATION_TYPES: InvestigationType[] = [
  'Fraud / Financial crime', 'Cyber / Infrastructure', 'OSINT / Research',
  'Counter-terrorism', 'Organised crime', 'Other',
]

type Section = 'profile' | 'appearance' | 'defaults' | 'canvas' | 'about'

const NAV: { id: Section; label: string; icon: string; group: string }[] = [
  { id: 'profile',    label: 'Profile',     icon: 'person',   group: 'Account'     },
  { id: 'appearance', label: 'Appearance',  icon: 'moon',     group: 'Preferences' },
  { id: 'defaults',   label: 'Defaults',    icon: 'settings', group: 'Preferences' },
  { id: 'canvas',     label: 'Canvas',      icon: 'node',     group: 'Preferences' },
  { id: 'about',      label: 'About',       icon: 'sort',     group: 'System'      },
]

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      style={{
        width: 40, height: 22, borderRadius: 11,
        background: value ? 'var(--accent)' : 'var(--border-mid)',
        position: 'relative', border: 'none', cursor: 'pointer',
        transition: 'background 0.18s', flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 3,
        left: value ? 21 : 3,
        width: 16, height: 16, borderRadius: '50%', background: '#fff',
        transition: 'left 0.18s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
      }} />
    </button>
  )
}

function SettingRow({
  label, description, children,
}: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 0', borderBottom: '1px solid var(--border-subtle)', gap: 24,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: description ? 3 : 0 }}>
          {label}
        </div>
        {description && (
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
            {description}
          </div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: description ? 6 : 0, letterSpacing: '-0.02em' }}>
        {title}
      </h2>
      {description && (
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.6 }}>{description}</p>
      )}
    </div>
  )
}

function GroupLabel({ label }: { label: string }) {
  return (
    <div style={{
      fontSize: 10.5, fontWeight: 600, color: 'var(--text-tertiary)',
      textTransform: 'uppercase', letterSpacing: '0.08em',
      marginTop: 24, marginBottom: 4,
    }}>
      {label}
    </div>
  )
}

function textInputStyle(focused: boolean): React.CSSProperties {
  return {
    width: '100%', padding: '8px 11px',
    background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: 13,
    border: `1px solid ${focused ? 'var(--accent-border)' : 'var(--border-soft)'}`,
    borderRadius: 'var(--r-md)', outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.12s',
  }
}

// ── Profile section ───────────────────────────────────────────────────────────

function ProfileSection() {
  const { analystName, analystInitials, setAnalystName, setAnalystInitials } = useSettingsStore()
  const [nameFocused, setNameFocused] = useState(false)
  const [initFocused, setInitFocused] = useState(false)

  const avatarColor = 'linear-gradient(135deg, var(--accent), var(--accent-dim))'

  return (
    <>
      <SectionTitle
        title="Profile"
        description="Your name and initials appear on nodes you add and in the analyst badge."
      />

      {/* Avatar preview */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px', marginBottom: 24,
        background: 'var(--bg-base)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--r-md)',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: avatarColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: 'var(--bg-base)', flexShrink: 0,
          letterSpacing: '0.02em',
        }}>
          {analystInitials || '?'}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
            {analystName || 'No name set'}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            Analyst · Raven
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 14, marginBottom: 0 }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
            Full name
          </label>
          <input
            value={analystName}
            onChange={e => setAnalystName(e.target.value)}
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
            placeholder="e.g. J. Ali"
            style={textInputStyle(nameFocused)}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
            Initials
          </label>
          <input
            value={analystInitials}
            onChange={e => setAnalystInitials(e.target.value)}
            onFocus={() => setInitFocused(true)}
            onBlur={() => setInitFocused(false)}
            placeholder="JA"
            maxLength={3}
            style={{ ...textInputStyle(initFocused), fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase' }}
          />
        </div>
      </div>
      <p style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginTop: 8, lineHeight: 1.5 }}>
        Changes apply immediately. Nodes already added keep their original analyst label.
      </p>
    </>
  )
}

// ── Appearance section ────────────────────────────────────────────────────────

function AppearanceSection() {
  const { theme, toggleTheme } = useTheme()

  const ThemeCard = ({ t, label }: { t: 'light' | 'dark'; label: string }) => {
    const active = theme === t
    const isLight = t === 'light'

    const bg      = isLight ? '#F0F2F5' : '#14151F'
    const surface = isLight ? '#FFFFFF' : '#1D1E2C'
    const border  = isLight ? '#E5E7EB' : '#21223A'
    const text1   = isLight ? '#111827' : '#EBEDF8'
    const text2   = isLight ? '#9CA3AF' : '#54556E'
    const accent  = isLight ? '#0a0a0b' : '#f2f2f4'

    return (
      <button
        onClick={() => { if (!active) toggleTheme() }}
        style={{
          flex: 1, padding: '14px 16px', borderRadius: 'var(--r-lg)', cursor: 'pointer',
          border: `2px solid ${active ? 'var(--accent)' : 'var(--border-soft)'}`,
          background: active ? 'var(--accent-soft)' : 'var(--bg-base)',
          textAlign: 'left', transition: 'all 0.15s',
        }}
      >
        {/* Mini UI preview */}
        <div style={{
          background: bg, borderRadius: 6, border: `1px solid ${border}`,
          overflow: 'hidden', marginBottom: 12, height: 90,
        }}>
          {/* Mock nav bar */}
          <div style={{ height: 24, background: surface, borderBottom: `1px solid ${border}`, padding: '0 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: accent, opacity: 0.9 }} />
            <div style={{ flex: 1 }} />
            <div style={{ width: 28, height: 10, borderRadius: 3, background: text2, opacity: 0.4 }} />
          </div>
          {/* Mock content cards */}
          <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[1, 0.7].map((op, i) => (
              <div key={i} style={{
                height: 20, background: surface, borderRadius: 4,
                border: `1px solid ${border}`, opacity: op,
                display: 'flex', alignItems: 'center', padding: '0 6px', gap: 4,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: accent }} />
                <div style={{ width: i === 0 ? 60 : 40, height: 5, borderRadius: 2, background: text1, opacity: 0.5 }} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
          {active && (
            <span style={{
              width: 18, height: 18, borderRadius: '50%', background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--bg-base)',
            }}>✓</span>
          )}
        </div>
      </button>
    )
  }

  return (
    <>
      <SectionTitle title="Appearance" description="Choose how Raven looks. Your preference is saved locally." />
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
          Theme
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <ThemeCard t="light" label="Light" />
          <ThemeCard t="dark" label="Dark" />
        </div>
      </div>
    </>
  )
}

// ── Defaults section ──────────────────────────────────────────────────────────

function DefaultsSection() {
  const { defaultClassification, defaultInvestigationType, setDefaultClassification, setDefaultInvestigationType } = useSettingsStore()

  const CLASS_LABELS: Record<Classification, string> = {
    'OFFICIAL': 'OFFICIAL', 'OFFICIAL-SENSITIVE': 'OFF-SENS', 'CUSTOM': 'CUSTOM',
  }

  return (
    <>
      <SectionTitle
        title="Defaults"
        description="Pre-fill values when creating new investigation graphs."
      />

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
          Default classification
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {CLASSIFICATIONS.map(cls => (
            <button
              key={cls}
              onClick={() => setDefaultClassification(cls)}
              style={{
                padding: '8px 12px', borderRadius: 'var(--r-md)', cursor: 'pointer',
                border: `1px solid ${defaultClassification === cls ? 'var(--accent-border)' : 'var(--border-soft)'}`,
                background: defaultClassification === cls ? 'var(--accent-soft)' : 'var(--bg-base)',
                color: defaultClassification === cls ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)',
                letterSpacing: '0.04em', transition: 'all 0.12s',
              }}
            >
              {CLASS_LABELS[cls]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
          Default investigation type
        </div>
        <select
          value={defaultInvestigationType}
          onChange={e => setDefaultInvestigationType(e.target.value as InvestigationType)}
          style={{
            width: '100%', maxWidth: 380, padding: '9px 12px',
            background: 'var(--bg-base)', border: '1px solid var(--border-soft)',
            borderRadius: 'var(--r-md)', color: 'var(--text-primary)',
            fontSize: 13, outline: 'none', cursor: 'pointer',
          }}
        >
          {INVESTIGATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
    </>
  )
}

// ── Canvas section ────────────────────────────────────────────────────────────

function CanvasSection() {
  const { showGrid, setShowGrid } = useSettingsStore()

  return (
    <>
      <SectionTitle title="Canvas" description="Adjust how the investigation graph canvas behaves and looks." />

      <SettingRow
        label="Show grid"
        description="Dot grid overlay on the canvas to help with node placement."
      >
        <Toggle value={showGrid} onChange={setShowGrid} />
      </SettingRow>
    </>
  )
}

// ── About section ─────────────────────────────────────────────────────────────

function AboutSection() {
  const { reset } = useSettingsStore()
  const [confirmReset, setConfirmReset] = useState(false)

  const handleClear = () => {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }
    reset()
    localStorage.removeItem('raven-theme')
    window.location.reload()
  }

  return (
    <>
      <SectionTitle title="About" />

      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '16px 18px', marginBottom: 24,
        background: 'var(--bg-base)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--r-md)',
      }}>
        <RavenLogo height={30} />
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
          Version 0.1.0
        </div>
      </div>

      <GroupLabel label="Data & storage" />
      <SettingRow
        label="Local storage only"
        description="All investigation data, settings, and graphs are stored in your browser. Nothing is sent to a server."
      >
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 'var(--r-xs)',
          background: 'var(--green-soft)', border: '1px solid var(--green-border)', color: 'var(--green)',
          fontFamily: 'var(--font-mono)',
        }}>
          LOCAL
        </span>
      </SettingRow>

      <GroupLabel label="Danger zone" />
      <div style={{
        padding: '14px 16px', borderRadius: 'var(--r-md)',
        border: '1px solid var(--red-border)', background: 'var(--red-soft)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 3 }}>
            Clear all local data
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
            Resets settings to defaults and reloads the app. Graph data is session-only and will be lost.
          </div>
        </div>
        <button
          onClick={handleClear}
          onBlur={() => setConfirmReset(false)}
          style={{
            padding: '7px 14px', borderRadius: 'var(--r-md)', cursor: 'pointer',
            background: confirmReset ? 'var(--red)' : 'transparent',
            border: `1px solid ${confirmReset ? 'var(--red)' : 'var(--red-border)'}`,
            color: confirmReset ? '#fff' : 'var(--red)',
            fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap',
            transition: 'all 0.15s', flexShrink: 0,
          }}
        >
          {confirmReset ? 'Confirm reset' : 'Clear data'}
        </button>
      </div>
    </>
  )
}

// ── Main settings page ────────────────────────────────────────────────────────

interface SettingsPageProps {
  onClose: () => void
  onLogout?: () => void
}

export function SettingsPage({ onClose, onLogout }: SettingsPageProps) {
  const [section, setSection] = useState<Section>('profile')
  const isMobile = useIsMobile()

  const groups = Array.from(new Set(NAV.map(n => n.group)))

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'var(--bg-base)', display: 'flex', flexDirection: 'column',
      animation: 'fadeIn 0.15s ease',
    }}>
      {/* ── Header ── */}
      <header style={{
        height: 52, flexShrink: 0, display: 'flex', alignItems: 'center',
        padding: '0 20px', gap: 12,
        background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button
          onClick={onClose}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 10px', borderRadius: 'var(--r-sm)',
            background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)', fontSize: 12.5, cursor: 'pointer',
            transition: 'all 0.12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border-mid)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
        >
          <UIIcon name="chevronLeft" size={13} />
          Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UIIcon name="settings" size={15} style={{ color: 'var(--text-tertiary)' }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            Settings
          </span>
        </div>
      </header>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row', overflow: 'hidden' }}>

        {/* Mobile tab strip */}
        {isMobile ? (
          <nav style={{
            display: 'flex', overflowX: 'auto', flexShrink: 0,
            background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)',
            padding: '0 4px',
            WebkitOverflowScrolling: 'touch' as React.CSSProperties['WebkitOverflowScrolling'],
            scrollbarWidth: 'none' as React.CSSProperties['scrollbarWidth'],
          }}>
            {NAV.map(item => {
              const active = section === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setSection(item.id)}
                  style={{
                    flexShrink: 0, padding: '12px 14px',
                    borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
                    color: active ? 'var(--accent)' : 'var(--text-tertiary)',
                    fontSize: 12, fontWeight: active ? 600 : 400,
                    background: 'none', border: 'none',
                    cursor: 'pointer', whiteSpace: 'nowrap',
                    transition: 'color 0.1s',
                  }}
                >
                  {item.label}
                </button>
              )
            })}
            {onLogout && (
              <button
                onClick={onLogout}
                style={{
                  flexShrink: 0, padding: '12px 14px', marginLeft: 'auto',
                  color: 'var(--text-tertiary)', fontSize: 12,
                  background: 'none', border: 'none', borderBottom: '2px solid transparent',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                Sign out
              </button>
            )}
          </nav>
        ) : (
          /* Desktop left nav */
          <nav style={{
            width: 210, flexShrink: 0,
            display: 'flex', flexDirection: 'column',
            background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)',
            padding: '16px 10px',
          }}>
            <div style={{ flex: 1 }}>
            {groups.map(group => {
              const items = NAV.filter(n => n.group === group)
              return (
                <div key={group} style={{ marginBottom: 20 }}>
                  <div style={{
                    fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    padding: '0 8px', marginBottom: 4,
                  }}>
                    {group}
                  </div>
                  {items.map(item => {
                    const active = section === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSection(item.id)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                          padding: '7px 8px', borderRadius: 'var(--r-sm)', cursor: 'pointer',
                          background: active ? 'var(--accent-soft)' : 'transparent',
                          border: `1px solid ${active ? 'var(--accent-border)' : 'transparent'}`,
                          color: active ? 'var(--accent)' : 'var(--text-secondary)',
                          fontSize: 13, fontWeight: active ? 500 : 400,
                          transition: 'all 0.1s', marginBottom: 1,
                        }}
                        onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' } }}
                        onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' } }}
                      >
                        <UIIcon name={item.icon} size={14} />
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              )
            })}
            </div>

            {onLogout && (
              <div style={{ paddingTop: 10, borderTop: '1px solid var(--border-subtle)', marginTop: 8 }}>
                <button
                  onClick={onLogout}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                    padding: '7px 8px', borderRadius: 'var(--r-sm)', cursor: 'pointer',
                    background: 'transparent', border: '1px solid transparent',
                    color: 'var(--text-tertiary)', fontSize: 13, fontWeight: 400,
                    transition: 'all 0.1s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,81,73,0.08)'; e.currentTarget.style.color = 'var(--red)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)' }}
                >
                  <UIIcon name="logout" size={14} />
                  Sign out
                </button>
              </div>
            )}
          </nav>
        )}

        {/* Content pane */}
        <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '24px 20px' : '32px 40px', maxWidth: isMobile ? '100%' : 680 }}>
          {section === 'profile'    && <ProfileSection />}
          {section === 'appearance' && <AppearanceSection />}
          {section === 'defaults'   && <DefaultsSection />}
          {section === 'canvas'     && <CanvasSection />}
          {section === 'about'      && <AboutSection />}
        </main>
      </div>
    </div>
  )
}
