import React from 'react'

interface UIIconProps {
  name: string
  size?: number
  strokeWidth?: number
  style?: React.CSSProperties
}

const PATHS: Record<string, React.ReactNode> = {
  search:       <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></>,
  plus:         <path d="M12 5v14M5 12h14" />,
  grid:         <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
  list:         <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  close:        <path d="M6 6l12 12M18 6L6 18" />,
  settings:     <><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></>,
  clock:        <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  arrowRight:   <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
  node:         <><circle cx="6" cy="6" r="3" /><circle cx="18" cy="6" r="3" /><circle cx="12" cy="18" r="3" /><path d="M6 9v2a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9" /></>,
  sort:         <path d="M3 6h18M7 12h10M11 18h2" />,
  filter:       <path d="M3 5h18l-7 8v6l-4 2v-8L3 5z" />,
  chevronLeft:  <path d="m15 18-6-6 6-6" />,
  chevronRight: <path d="m9 18 6-6-6-6" />,
  chevronDown:  <path d="m6 9 6 6 6-6" />,
  sun:          <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></>,
  moon:         <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
  crosshair:    <><circle cx="12" cy="12" r="7" /><line x1="12" y1="2" x2="12" y2="7" /><line x1="12" y1="17" x2="12" y2="22" /><line x1="2" y1="12" x2="7" y2="12" /><line x1="17" y1="12" x2="22" y2="12" /></>,
  help:         <><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><circle cx="12" cy="17" r="0.5" fill="currentColor" /></>,
  logout:       <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>,
  // entity type icons
  ip:           <><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M12 12h.01M8 12h.01M16 12h.01" /></>,
  domain:       <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></>,
  email:        <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></>,
  person:       <><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></>,
  org:          <><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" /><path d="M6 12H4a2 2 0 0 0-2 2v8h20v-8a2 2 0 0 0-2-2h-2" /><rect x="10" y="6" width="4" height="4" /></>,
  phone:        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 9.8 19.79 19.79 0 0 1 1.05 1.17 2 2 0 0 1 3 .01h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 14.92z" />,
  wallet:       <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /><circle cx="16" cy="15" r="1" /></>,
  url:          <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>,
  bank:         <><line x1="3" y1="22" x2="21" y2="22" /><line x1="6" y1="18" x2="6" y2="11" /><line x1="10" y1="18" x2="10" y2="11" /><line x1="14" y1="18" x2="14" y2="11" /><line x1="18" y1="18" x2="18" y2="11" /><polygon points="12 2 20 7 4 7" /></>,
  cert:         <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  social:       <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></>,
  company:      <><rect x="9" y="2" width="6" height="4" rx="1" /><path d="M8 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-2" /><path d="m9 12 2 2 4-4" /></>,
  transaction:  <><path d="m16 3 4 4-4 4" /><path d="M20 7H4" /><path d="m8 21-4-4 4-4" /><path d="M4 17h16" /></>,
  takedown:     <><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></>,
  location:     <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
  fraudreport:  <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 9h6" /><path d="M9 13h6" /><path d="M9 17h4" /></>,
  hash:         <><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" /></>,

  bell:         <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
  template:     <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="3" rx="1" /><rect x="3" y="19" width="7" height="2" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  map:          <><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6" /><path d="M9 3v15M15 6v15" /></>,
  timeline:     <><line x1="3" y1="12" x2="21" y2="12" /><circle cx="6" cy="12" r="2" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" /><circle cx="18" cy="12" r="2" fill="currentColor" stroke="none" /><line x1="6" y1="8" x2="6" y2="12" /><line x1="12" y1="6" x2="12" y2="12" /><line x1="18" y1="9" x2="18" y2="12" /></>,
  path:         <><circle cx="4" cy="12" r="2.5" /><circle cx="20" cy="12" r="2.5" /><circle cx="12" cy="7" r="2.5" /><path d="M6 12q3-3 6-5M14 7q3 2 4.5 5" strokeDasharray="3 2" /></>,
  report:       <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="14" y2="17" /></>,

  // ── Filled / solid toolbar icons ──────────────────────────────────────────
  // Each uses fill="currentColor" stroke="none" at path level to override the
  // SVG-level stroke="currentColor" set on the <svg> wrapper.

  searchFilled: (
    // Solid donut-ring lens + thick handle
    <path fill="currentColor" stroke="none" fillRule="evenodd" clipRule="evenodd"
      d="M10.5 2a8.5 8.5 0 1 0 5.33 15.12l3.54 3.55a1.5 1.5 0 0 0 2.12-2.12l-3.54-3.55A8.5 8.5 0 0 0 10.5 2zm-5.5 8.5a5.5 5.5 0 1 1 11 0 5.5 5.5 0 0 1-11 0z"
    />
  ),

  nodeAddFilled: (
    // Filled circle with a + cross cut out — "add an entity node"
    <path fill="currentColor" stroke="none"
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 11h-3.5v3.5a1 1 0 0 1-2 0V13H7.5a1 1 0 0 1 0-2H11V7.5a1 1 0 0 1 2 0V11h3.5a1 1 0 0 1 0 2z"
    />
  ),

  uploadFilled: (
    // Solid up-arrow above a baseline — "import / upload a file"
    <path fill="currentColor" stroke="none"
      d="M12 2.25a.75.75 0 0 0-.53.22l-4.5 4.5a.75.75 0 1 0 1.06 1.06L11.25 5.56V15a.75.75 0 0 0 1.5 0V5.56l3.22 3.22a.75.75 0 1 0 1.06-1.06l-4.5-4.5A.75.75 0 0 0 12 2.25zM3.75 19.5a.75.75 0 0 0 0 1.5h16.5a.75.75 0 0 0 0-1.5H3.75z"
    />
  ),

  downloadFilled: (
    // Solid down-arrow above a baseline — "export / download a file"
    <path fill="currentColor" stroke="none"
      d="M12 15.75a.75.75 0 0 1-.53-.22l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V4.5a.75.75 0 0 1 1.5 0v8.94l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-.53.22zM3.75 19.5a.75.75 0 0 0 0 1.5h16.5a.75.75 0 0 0 0-1.5H3.75z"
    />
  ),

  treeLayoutFilled: (
    // Root node at top, two child nodes at bottom, connected by lines — "auto-layout graph"
    <>
      <circle cx="12" cy="4.5"  r="2.5" fill="currentColor" stroke="none"/>
      <circle cx="5"  cy="19.5" r="2.5" fill="currentColor" stroke="none"/>
      <circle cx="19" cy="19.5" r="2.5" fill="currentColor" stroke="none"/>
      <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        d="M12 7v5M12 12L5 17M12 12L19 17"/>
    </>
  ),

  historyFilled: (
    // Filled clock face with hour + minute hands
    <path fill="currentColor" stroke="none"
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.75 10.56V7a.75.75 0 0 0-1.5 0v5.94l3.72 2.23a.75.75 0 0 0 .78-1.28l-3-1.8v.47z"
    />
  ),

  funnelFilled: (
    // Solid tapering funnel — "filter entities"
    <path fill="currentColor" stroke="none"
      d="M3.53 3A1.5 1.5 0 0 0 2.1 5.17L9 12.9V19a1.5 1.5 0 0 0 2.18 1.34l3.5-1.75A1.5 1.5 0 0 0 15.5 17v-4.1l6.9-7.73A1.5 1.5 0 0 0 21.27 3H3.53z"
    />
  ),
}

export function UIIcon({ name, size = 16, strokeWidth = 1.6, style }: UIIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden="true"
    >
      {PATHS[name] ?? <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />}
    </svg>
  )
}
