import { useTheme } from '../context/ThemeContext'

interface RavenLogoProps {
  height?: number
  forceTheme?: 'light' | 'dark'
  style?: React.CSSProperties
}

export function RavenLogo({ height = 28, forceTheme, style }: RavenLogoProps) {
  const { theme } = useTheme()
  const isDark = (forceTheme ?? theme) === 'dark'

  return (
    <img
      src={isDark ? '/raven_logo_white.png' : '/raven_logo_black.png'}
      alt="Raven"
      height={height}
      style={{ display: 'block', width: 'auto', ...style }}
    />
  )
}

interface RavenIconProps {
  size?: number
  forceTheme?: 'light' | 'dark'
  style?: React.CSSProperties
}

export function RavenIcon({ size = 24, forceTheme, style }: RavenIconProps) {
  const { theme } = useTheme()
  const isDark = (forceTheme ?? theme) === 'dark'

  return (
    <img
      src={isDark ? '/raven_icon_white.png' : '/raven_icon_black.png'}
      alt="Raven"
      width={size}
      height={size}
      style={{ display: 'block', ...style }}
    />
  )
}
