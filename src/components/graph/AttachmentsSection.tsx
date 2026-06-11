import { useEffect, useRef, useState, useCallback } from 'react'
import {
  type AttachmentRecord,
  addAttachment, getNodeAttachments, deleteAttachment,
  formatBytes, isImage, MAX_FILE_BYTES,
} from '../../lib/attachmentDb'

const FILE_ICON: Record<string, string> = {
  'application/pdf':  '📄',
  'text/plain':       '📝',
  'text/csv':         '📊',
  'application/json': '{ }',
  'application/zip':  '🗜',
  'application/pcap': '🔬',
  'video/mp4':        '🎬',
  'audio/mpeg':       '🔊',
}

function fileIcon(mimeType: string): string {
  if (isImage(mimeType)) return '🖼'
  return FILE_ICON[mimeType] ?? '📎'
}

interface ThumbnailProps {
  record: AttachmentRecord
}

function Thumbnail({ record }: ThumbnailProps) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!isImage(record.mimeType)) return
    const blob = new Blob([record.data], { type: record.mimeType })
    const objectUrl = URL.createObjectURL(blob)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [record])

  if (!url) return null
  return (
    <img
      src={url}
      alt={record.name}
      style={{
        width: 36, height: 36, objectFit: 'cover',
        borderRadius: 4, flexShrink: 0,
        border: '1px solid var(--border-subtle)',
      }}
    />
  )
}

interface Props {
  nodeId: string
}

export function AttachmentsSection({ nodeId }: Props) {
  const [attachments, setAttachments]   = useState<AttachmentRecord[]>([])
  const [loading, setLoading]           = useState(true)
  const [dragging, setDragging]         = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [preview, setPreview]           = useState<{ url: string; name: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const recs = await getNodeAttachments(nodeId)
      recs.sort((a, b) => b.addedAt.localeCompare(a.addedAt))
      setAttachments(recs)
    } finally {
      setLoading(false)
    }
  }, [nodeId])

  useEffect(() => { load() }, [load])

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setError(null)
    const arr = Array.from(files)
    for (const file of arr) {
      if (file.size > MAX_FILE_BYTES) {
        setError(`${file.name} exceeds the 20 MB limit`)
        continue
      }
      const data = await file.arrayBuffer()
      const record: AttachmentRecord = {
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        nodeId,
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        data,
        addedAt: new Date().toISOString(),
      }
      await addAttachment(record)
    }
    load()
  }, [nodeId, load])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length) await handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleDelete = async (id: string) => {
    await deleteAttachment(id)
    load()
  }

  const handleOpen = (record: AttachmentRecord) => {
    const blob = new Blob([record.data], { type: record.mimeType })
    const url  = URL.createObjectURL(blob)
    if (isImage(record.mimeType)) {
      setPreview({ url, name: record.name })
    } else {
      const a = Object.assign(document.createElement('a'), {
        href: url, download: record.name,
      })
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 2000)
    }
  }

  return (
    <>
      {/* Image lightbox */}
      {preview && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, cursor: 'zoom-out',
          }}
          onClick={() => { URL.revokeObjectURL(preview.url); setPreview(null) }}
        >
          <img
            src={preview.url}
            alt={preview.name}
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 8, boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }}
            onClick={e => e.stopPropagation()}
          />
          <div style={{
            position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
            color: 'rgba(255,255,255,0.7)', fontSize: 12,
          }}>
            {preview.name}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{
            fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)',
            textTransform: 'uppercase', letterSpacing: '0.07em', flex: 1,
          }}>
            Attachments {attachments.length > 0 && `(${attachments.length})`}
          </span>
          <button
            onClick={() => inputRef.current?.click()}
            style={{
              fontSize: 10.5, color: 'var(--accent)', background: 'none', border: 'none',
              cursor: 'pointer', padding: '2px 4px', fontWeight: 600,
            }}
          >
            + Attach
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={e => e.target.files && handleFiles(e.target.files)}
          />
        </div>

        {error && (
          <div style={{
            fontSize: 11, color: 'var(--red)', background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)', borderRadius: 6,
            padding: '5px 8px', marginBottom: 8,
          }}>
            {error}
          </div>
        )}

        {/* Drop zone — shown when no files, or always visible */}
        {!loading && attachments.length === 0 && (
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `1.5px dashed ${dragging ? 'var(--accent)' : 'var(--border-soft)'}`,
              borderRadius: 8, padding: '14px 12px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
              cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s',
              background: dragging ? 'rgba(99,102,241,0.05)' : 'transparent',
            }}
          >
            <span style={{ fontSize: 20, opacity: 0.4 }}>📎</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Drop files or click to attach
            </span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', opacity: 0.7 }}>
              Screenshots, documents, PCAPs — up to 20 MB each
            </span>
          </div>
        )}

        {/* File list */}
        {attachments.length > 0 && (
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            style={{
              display: 'flex', flexDirection: 'column', gap: 4,
              outline: dragging ? '2px dashed var(--accent)' : 'none',
              borderRadius: 6, padding: dragging ? 4 : 0, transition: 'outline 0.1s',
            }}
          >
            {attachments.map(rec => (
              <div
                key={rec.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 8px', borderRadius: 7,
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                }}
                onClick={() => handleOpen(rec)}
              >
                {isImage(rec.mimeType) ? (
                  <Thumbnail record={rec} />
                ) : (
                  <span style={{
                    fontSize: 20, flexShrink: 0,
                    width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {fileIcon(rec.mimeType)}
                  </span>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 11.5, fontWeight: 500, color: 'var(--text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {rec.name}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
                    {formatBytes(rec.sizeBytes)}
                    {' · '}
                    {new Date(rec.addedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(rec.id) }}
                  title="Remove attachment"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', fontSize: 14, lineHeight: 1,
                    padding: '2px 4px', borderRadius: 4, flexShrink: 0,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--red)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)' }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
