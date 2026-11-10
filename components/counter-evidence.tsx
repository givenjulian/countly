'use client'

import { Image, ImagePlus, Loader2, Trash2, X } from 'lucide-react'
import { useRef, useState } from 'react'
import type { CounterEvidence } from '@/lib/counter-evidence'

export function CounterEvidenceGallery({ evidence, loading, uploading, error, onLoad, onUpload, onDelete }: { evidence: CounterEvidence[]; loading: boolean; uploading: boolean; error: string; onLoad: () => void; onUpload: (file: File) => Promise<void>; onDelete: (item: CounterEvidence) => Promise<void> }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<CounterEvidence | null>(null)
  const [open, setOpen] = useState(false)

  const toggleGallery = () => {
    const nextOpen = !open
    setOpen(nextOpen)
    if (nextOpen && evidence.length === 0) onLoad()
  }

  return <section className="mt-3" aria-label="Counter evidence">
    <div className="flex items-center justify-end gap-1"><button type="button" className="inline-flex size-8 items-center justify-center rounded-full bg-foreground/10 transition-colors hover:bg-foreground/15" onClick={toggleGallery} aria-expanded={open} aria-label={open ? 'Tutup image' : 'Lihat image'} title={open ? 'Tutup image' : 'Lihat image'}><Image className="size-4" aria-hidden="true" /></button>{open && <button type="button" className="inline-flex size-8 items-center justify-center rounded-full bg-foreground/10 transition-colors hover:bg-foreground/15 disabled:opacity-50" onClick={() => inputRef.current?.click()} disabled={uploading} aria-label="Upload image" title={uploading ? 'Mengupload...' : 'Upload image'}><ImagePlus className="size-4" aria-hidden="true" /></button>}</div><input ref={inputRef} className="sr-only" type="file" accept="image/*" onChange={async (event) => { const file = event.target.files?.[0]; event.target.value = ''; if (file) await onUpload(file) }} />
    {open && <>
      {loading && <div className="mt-3 flex items-center gap-2 text-xs opacity-70"><Loader2 className="size-4 animate-spin" />Memuat gambar...</div>}
      {error && <p className="mt-3 text-xs font-medium text-red-700 dark:text-red-300">{error}</p>}
      {evidence.length > 0 && <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">{evidence.map((item) => <div key={item.id} className="group relative aspect-square overflow-hidden rounded-xl bg-foreground/10"><button type="button" className="size-full" onClick={() => setPreview(item)}><img src={item.url} alt={item.fileName} className="size-full object-cover transition-transform group-hover:scale-105" /></button><button type="button" className="absolute right-1 top-1 rounded-full bg-background/80 p-1 opacity-0 shadow-sm transition-opacity group-hover:opacity-100" onClick={() => void onDelete(item)} aria-label={`Hapus ${item.fileName}`}><Trash2 className="size-3.5" aria-hidden="true" /></button></div>)}</div>}
      {!loading && evidence.length === 0 && !error && <p className="mt-3 text-xs opacity-65">Belum ada image untuk counter ini.</p>}
    </>}
    {preview && <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/70 p-4" role="dialog" aria-modal="true" aria-label={preview.fileName} onClick={() => setPreview(null)}><div className="relative max-h-full max-w-4xl" onClick={(event) => event.stopPropagation()}><img src={preview.url} alt={preview.fileName} className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl" /><button type="button" className="absolute -right-2 -top-2 rounded-full bg-background p-2 text-foreground shadow-lg" onClick={() => setPreview(null)} aria-label="Tutup preview"><X className="size-5" aria-hidden="true" /></button></div></div>}
  </section>
}
