function resolveVars(str: string): string {
  const cs = getComputedStyle(document.documentElement)
  return str.replace(/var\(--([^)]+)\)/g, (_, name) => {
    return cs.getPropertyValue(`--${name}`).trim() || 'transparent'
  })
}

export async function exportGraphToPNG(
  svgEl: SVGSVGElement,
  filename: string
): Promise<void> {
  const { width: w, height: h } = svgEl.getBoundingClientRect()
  const pw = Math.round(w)
  const ph = Math.round(h)

  const cs = getComputedStyle(document.documentElement)
  const bgColor = cs.getPropertyValue('--bg-base').trim()

  // Parse into a real DOM so we can mutate before re-serialising
  const raw = new XMLSerializer().serializeToString(svgEl)
  const parser = new DOMParser()
  const doc = parser.parseFromString(raw, 'image/svg+xml')
  const root = doc.documentElement as unknown as SVGSVGElement

  // Set explicit pixel dimensions (the element uses style width/height: 100%)
  root.setAttribute('width', String(pw))
  root.setAttribute('height', String(ph))
  root.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  const s = root.getAttribute('style') ?? ''
  root.setAttribute('style', s.replace(/\b(width|height)\s*:[^;]+;?/g, ''))

  // Inject a background rect as the very first child
  const bg = doc.createElementNS('http://www.w3.org/2000/svg', 'rect')
  bg.setAttribute('width', String(pw))
  bg.setAttribute('height', String(ph))
  bg.setAttribute('fill', bgColor)
  root.insertBefore(bg, root.firstChild)

  // Resolve all CSS variables in the serialised string
  const processed = resolveVars(new XMLSerializer().serializeToString(doc))

  // Render into a canvas at device pixel ratio (capped at 2× for file size)
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const canvas = document.createElement('canvas')
  canvas.width  = pw * dpr
  canvas.height = ph * dpr
  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)

  const blob = new Blob([processed], { type: 'image/svg+xml;charset=utf-8' })
  const objUrl = URL.createObjectURL(blob)

  await new Promise<void>((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, pw, ph)
      URL.revokeObjectURL(objUrl)
      resolve()
    }
    img.onerror = () => {
      URL.revokeObjectURL(objUrl)
      reject(new Error('SVG render failed'))
    }
    img.src = objUrl
  })

  // Trigger download
  canvas.toBlob(pngBlob => {
    if (!pngBlob) return
    const a = document.createElement('a')
    const dlUrl = URL.createObjectURL(pngBlob)
    a.href = dlUrl
    a.download = `${filename}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(dlUrl), 10_000)
  }, 'image/png')
}
