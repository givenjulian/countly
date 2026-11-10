'use client'

import { Check, CloudUpload, Plus, RefreshCw } from 'lucide-react'
import type { CounterSession } from '@/lib/counter-types'

type SessionBarProps = {
  sessions: CounterSession[]
  activeSessionId: string
  activeSession?: CounterSession
  syncing: boolean
  creatingSession: boolean
  syncError: string
  onSwitch: (id: string) => void
  onCreate: (name: string) => void | Promise<void>
  onRename: (name: string) => void
  onSync: () => void
}

export function SessionBar({ sessions, activeSessionId, activeSession, syncing, creatingSession, syncError, onSwitch, onCreate, onRename, onSync }: SessionBarProps) {
  const dirty = !activeSession?.syncedAt || (activeSession.updatedAt > (activeSession.syncedAt ?? 0))
  return <section className="mt-6 rounded-3xl border border-border bg-card p-4 shadow-sm"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div className="min-w-0 flex-1"><label htmlFor="session-select" className="eyebrow">Active session</label><div className="mt-2 flex items-center gap-2"><select id="session-select" value={activeSessionId} onChange={(event) => onSwitch(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring">{sessions.map((session) => <option key={session.id} value={session.id}>{session.name}</option>)}</select><button type="button" className="icon-button size-10 shrink-0" onClick={() => { const name = window.prompt('Nama session', activeSession?.name ?? '') ?? ''; if (name.trim()) onRename(name) }} aria-label="Rename active session"><span className="text-sm font-semibold">Aa</span></button></div></div><div className="flex items-center gap-2"><button type="button" className="secondary-button flex-1 sm:flex-none" onClick={() => { const name = window.prompt('Nama session baru', `Session ${sessions.length + 1}`) ?? ''; if (name.trim()) void onCreate(name) }} disabled={creatingSession}>{creatingSession ? <RefreshCw data-icon="inline-start" className="animate-spin" /> : <Plus data-icon="inline-start" />}{creatingSession ? 'Creating…' : 'New session'}</button><button type="button" className="primary-button flex-1 sm:flex-none" onClick={onSync} disabled={syncing || !activeSession} title="Only this button sends local data to Supabase">{syncing ? <RefreshCw data-icon="inline-start" className="animate-spin" /> : <CloudUpload data-icon="inline-start" />}{syncing ? 'Updating…' : 'Update Supabase'}</button></div></div><div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">{dirty ? <><span className="size-2 rounded-full bg-counter-amber" />Local changes not uploaded</> : <><Check data-icon="inline-start" />Synced to Supabase</>}{syncError && <span className="text-destructive">{syncError}</span>}</div></section>
}
