import React, { useEffect } from 'react'
import { UIIcon } from '../../icons/UIIcon'

interface ShortcutsModalProps {
  onClose: () => void
}

const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform)
const Mod = isMac ? '⌘' : 'Ctrl'

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 26, height: 22, padding: '0 6px',
      background: 'var(--bg-raised)',
      border: '1px solid var(--border-soft)',
      borderBottom: '2px solid var(--border-mid)',
      borderRadius: 'var(--r-xs)',
      fontSize: 11, fontFamily: 'var(--font-mono)',
      color: 'var(--text-secondary)', fontWeight: 500,
      whiteSpace: 'nowrap', fontStyle: 'normal',
    }}>
      {children}
    </kbd>
  )
}

function Keys({ keys }: { keys: string[] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      {keys.map((k, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span style={{ fontSize: 10, color: 'var(--text-tertiary)', padding: '0 1px' }}>+</span>}
          <Key>{k}</Key>
        </React.Fragment>
      ))}
    </div>
  )
}

function Row({ label, keys }: { label: string; keys: string[] }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '5px 0',
    }}>
      <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{label}</span>
      <Keys keys={keys} />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        marginBottom: 6, paddingBottom: 6,
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

export function ShortcutsModal({ onClose }: ShortcutsModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.12s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 440, maxHeight: '80vh', overflow: 'hidden auto',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-soft)',
          borderRadius: 'var(--r-xl)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          animation: 'fadeUp 0.18s ease',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px 14px',
          borderBottom: '1px solid var(--border-subtle)',
          position: 'sticky', top: 0, background: 'var(--bg-surface)', zIndex: 1,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UIIcon name="help" size={15} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              Keyboard shortcuts
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ color: 'var(--text-tertiary)', display: 'flex', padding: 4, cursor: 'pointer', borderRadius: 'var(--r-xs)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)' }}
          >
            <UIIcon name="close" size={14} />
          </button>
        </div>

        {/* Body — two columns */}
        <div style={{ padding: '20px 20px 4px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>

          <div>
            <Section title="Canvas">
              <Row label="Pan"          keys={['drag']} />
              <Row label="Zoom"         keys={['scroll']} />
              <Row label="Reset view"   keys={['⊙']} />
            </Section>

            <Section title="Nodes">
              <Row label="Select"        keys={['click']} />
              <Row label="Deselect"      keys={['click bg']} />
              <Row label="Move"          keys={['drag node']} />
              <Row label="Context menu"  keys={['right-click']} />
              <Row label="Start edge"    keys={['hover → dot']} />
              <Row label="Delete edge"   keys={['click edge']} />
            </Section>
          </div>

          <div>
            <Section title="Search">
              <Row label="Open search"   keys={[Mod, 'F']} />
              <Row label="Close"         keys={['Esc']} />
            </Section>

            <Section title="Focus mode">
              <Row label="Focus node"    keys={['F']} />
              <Row label="Exit focus"    keys={['Esc']} />
            </Section>

            <Section title="Panels">
              <Row label="Shortcuts"     keys={['?']} />
              <Row label="Close panel"   keys={['Esc']} />
            </Section>
          </div>
        </div>

        {/* Footer tip */}
        <div style={{
          margin: '8px 20px 16px',
          padding: '10px 12px',
          background: 'var(--accent-soft)',
          border: '1px solid var(--accent-border)',
          borderRadius: 'var(--r-md)',
          fontSize: 11.5, color: 'var(--accent)',
          lineHeight: 1.5,
        }}>
          <strong>Tip:</strong> Right-click any node to focus, flag, connect, or remove it without leaving the canvas.
        </div>
      </div>
    </div>
  )
}
