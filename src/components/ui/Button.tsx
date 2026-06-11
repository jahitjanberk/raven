import React, { useState } from 'react'
import { UIIcon } from '../../icons/UIIcon'

interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'ghost' | 'outline'
  size?: 'sm' | 'md'
  icon?: string
  iconPosition?: 'left' | 'right'
  onClick?: () => void
  disabled?: boolean
  style?: React.CSSProperties
}

export function Button({ children, variant = 'ghost', size = 'md', icon, iconPosition = 'left', onClick, disabled, style }: ButtonProps) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

  const sizes = {
    sm: { padding: '5px 10px', fontSize: 12, height: 30 },
    md: { padding: '7px 14px', fontSize: 13, height: 36 },
  }

  const base: Record<string, React.CSSProperties> = {
    primary: { background: 'var(--accent-gradient)', color: 'var(--bg-base)', border: '1px solid transparent' },
    ghost:   { background: 'transparent',            color: 'var(--text-secondary)', border: '1px solid transparent' },
    outline: { background: 'var(--bg-raised)',        color: 'var(--text-primary)',   border: '1px solid var(--border-soft)' },
  }

  const hover: Record<string, React.CSSProperties> = {
    primary: { opacity: 0.88 },
    ghost:   { background: 'var(--bg-hover)', color: 'var(--text-primary)' },
    outline: { borderColor: 'var(--border-mid)', background: 'var(--bg-overlay)' },
  }

  const active: Record<string, React.CSSProperties> = {
    primary: { opacity: 0.75, transform: 'scale(0.965)' },
    ghost:   { background: 'var(--bg-overlay)', color: 'var(--text-primary)', transform: 'scale(0.965)' },
    outline: { borderColor: 'var(--border-strong)', background: 'var(--bg-overlay)', transform: 'scale(0.965)' },
  }

  const interactive = !disabled
  const stateStyle = interactive && pressed
    ? active[variant]
    : interactive && hovered
      ? hover[variant]
      : {}

  return (
    <button
      onClick={interactive ? onClick : undefined}
      onMouseEnter={() => { if (interactive) setHovered(true) }}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onMouseDown={() => { if (interactive) setPressed(true) }}
      onMouseUp={() => setPressed(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        fontFamily: 'var(--font-sans)', fontWeight: 500, whiteSpace: 'nowrap',
        borderRadius: 'var(--r-sm)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        ...sizes[size],
        ...base[variant],
        ...stateStyle,
        ...style,
      }}
    >
      {icon && iconPosition === 'left'  && <UIIcon name={icon} size={size === 'sm' ? 13 : 15} />}
      {children}
      {icon && iconPosition === 'right' && <UIIcon name={icon} size={size === 'sm' ? 13 : 15} />}
    </button>
  )
}
