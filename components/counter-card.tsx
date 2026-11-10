'use client'

import Link from 'next/link'
import { Check, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { COLOR_STYLES, type Counter } from '@/lib/counter-types'
import type { CounterEvidence } from '@/lib/counter-evidence'
import { AnimatedNumber } from './animated-number'
import { CounterControl } from './counter-control'
import { CounterEvidenceGallery } from './counter-evidence'

export function CounterCard({ counter, onPress, onRelease, onRename, onDelete, evidence, evidenceLoading, evidenceUploading, evidenceError, onLoadEvidence, onUploadEvidence, onDeleteEvidence }: { counter: Counter; onPress: (id: string, delta: 1 | -1) => void; onRelease: () => void; onRename: (id: string, name: string) => void; onDelete: (id: string) => void; evidence: CounterEvidence[]; evidenceLoading: boolean; evidenceUploading: boolean; evidenceError: string; onLoadEvidence: () => void; onUploadEvidence: (file: File) => Promise<void>; onDeleteEvidence: (item: CounterEvidence) => Promise<void> }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(counter.name)
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => setName(counter.name), [counter.name])
  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])
  const saveName = () => { onRename(counter.id, name); setEditing(false) }
  const confirmDelete = () => { if (window.confirm(`Hapus counter “${counter.name}”? Data counter ini akan dihapus dari session lokal.`)) onDelete(counter.id) }
    const style = COLOR_STYLES[counter.color]

  return <article className={`counter-card ${style.surface}`}>
<div className="flex items-start justify-between gap-3"><div className="min-w-0 flex-1">{editing ? <form className="flex items-center gap-2" onSubmit={(event) => { event.preventDefault(); saveName() }}><label htmlFor={`counter-name-${counter.id}`} className="sr-only">Edit counter name</label><input ref={inputRef} id={`counter-name-${counter.id}`} value={name} onChange={(event) => setName(event.target.value)} onBlur={saveName} className="min-w-0 w-full rounded-lg border border-foreground/20 bg-background/20 px-2 py-1 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-foreground/60" /><button type="submit" className="rounded-full p-1" aria-label="Save counter name"><Check aria-hidden="true" /></button></form> : <Link href={`/counter/${counter.id}`} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/60"><span className="block truncate text-sm font-semibold opacity-80">{counter.name}</span><span className="mt-1 block text-xs opacity-60">Tap card for fullscreen</span></Link>}</div><div className="flex shrink-0 items-center gap-1"><button type="button" className="rounded-full p-1 opacity-60 transition-opacity hover:opacity-100" onClick={() => setEditing(true)} aria-label={`Edit ${counter.name}`}><Pencil aria-hidden="true" /></button><button type="button" className="rounded-full p-1 opacity-60 transition-opacity hover:opacity-100" onClick={confirmDelete} aria-label={`Delete ${counter.name}`}><Trash2 aria-hidden="true" /></button></div></div><div className="flex items-center justify-between gap-2 pb-1 pt-5 sm:gap-3 sm:pt-8"><CounterControl delta={-1} label={`Decrease ${counter.name}`} onPress={() => onPress(counter.id, -1)} onRelease={onRelease} /><Link href={`/counter/${counter.id}`} className="flex min-w-0 flex-1 justify-center rounded-2xl py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"><AnimatedNumber value={counter.value} /></Link><CounterControl delta={1} label={`Increase ${counter.name}`} onPress={() => onPress(counter.id, 1)} onRelease={onRelease} /></div><CounterEvidenceGallery evidence={evidence} loading={evidenceLoading} uploading={evidenceUploading} error={evidenceError} onLoad={onLoadEvidence} onUpload={onUploadEvidence} onDelete={onDeleteEvidence} /></article>
}
