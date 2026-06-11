// IndexedDB wrapper for file attachments — no size pressure vs localStorage

const DB_NAME    = 'raven_attachments'
const DB_VERSION = 1
const STORE      = 'attachments'

export interface AttachmentRecord {
  id: string
  nodeId: string
  name: string
  mimeType: string
  sizeBytes: number
  data: ArrayBuffer
  addedAt: string
}

let _dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (!_dbPromise) {
    _dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION)
      req.onupgradeneeded = () => {
        const db = req.result
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: 'id' })
          store.createIndex('nodeId', 'nodeId', { unique: false })
        }
      }
      req.onsuccess  = () => resolve(req.result)
      req.onerror    = () => { _dbPromise = null; reject(req.error) }
    })
  }
  return _dbPromise
}

export async function addAttachment(record: AttachmentRecord): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(record)
    tx.oncomplete = () => resolve()
    tx.onerror    = () => reject(tx.error)
  })
}

export async function getNodeAttachments(nodeId: string): Promise<AttachmentRecord[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).index('nodeId').getAll(nodeId)
    req.onsuccess = () => resolve(req.result)
    req.onerror   = () => reject(req.error)
  })
}

export async function deleteAttachment(id: string): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror    = () => reject(tx.error)
  })
}

export async function deleteNodeAttachments(nodeId: string): Promise<void> {
  const records = await getNodeAttachments(nodeId)
  await Promise.all(records.map(r => deleteAttachment(r.id)))
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024)       return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'])
export const isImage = (mimeType: string) => IMAGE_TYPES.has(mimeType)

export const MAX_FILE_BYTES = 20 * 1024 * 1024 // 20 MB hard limit per file
