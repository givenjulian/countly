'use client'

import { useEffect, useState } from 'react'
import { Plus, Settings2 } from 'lucide-react'
import { useCounters } from '@/hooks/use-counters'
import { CounterCard } from './counter-card'
import { SessionBar } from './session-bar'
import { SettingsPanel } from './settings-panel'
import { UserMenu } from './auth/user-menu'

export function CounterApp() {
  const { sessions, activeSession, activeSessionId, counters, preferences, beginPress, stopRepeating, resetCounter, deleteCounter, renameCounter, addCounter, createSession, switchSession, renameSession, syncing, creatingSession, syncError, syncActiveSession, updatePreferences, evidenceByCounter, evidenceLoading, evidenceUploading, evidenceError, loadEvidence, uploadEvidence, removeEvidence } = useCounters()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    const applyTheme = () => {
      const dark = preferences.theme === 'dark' || (preferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      root.classList.toggle('dark', dark)
    }
    applyTheme()
    if (preferences.theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)')
      media.addEventListener('change', applyTheme)
      return () => media.removeEventListener('change', applyTheme)
    }
  }, [preferences.theme])

  const createCounter = () => { addCounter(newName); setNewName(''); setAdding(false) }
  return <main className="mx-auto min-h-screen max-w-6xl px-3 pb-6 pt-3 sm:px-8 sm:pb-10 sm:pt-10"><header className="flex items-center justify-between gap-4"><div><p className="eyebrow">Your little tally space</p><h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Counters</h1></div><div className="flex items-center gap-2"><UserMenu /><button type="button" className="icon-button" onClick={() => setSettingsOpen(true)} aria-label="Open settings"><Settings2 aria-hidden="true" /></button></div></header><SessionBar sessions={sessions} activeSessionId={activeSessionId} activeSession={activeSession} syncing={syncing} creatingSession={creatingSession} syncError={syncError} onSwitch={switchSession} onCreate={createSession} onRename={renameSession} onSync={syncActiveSession} /><section className="mt-4 flex items-end justify-between gap-3 sm:mt-8 sm:gap-4"><div><p className="text-sm text-muted-foreground">{counters.length} {counters.length === 1 ? 'counter' : 'counters'} in this session</p><p className="mt-1 text-sm text-muted-foreground">Sesi baru langsung diamankan di Supabase. Counter dikirim saat kamu tap Update.</p></div><button type="button" className="primary-button" onClick={() => setAdding(true)}><Plus data-icon="inline-start" />Add counter</button></section>{adding && <form className="mt-3 flex gap-2 rounded-3xl border border-border bg-card p-3 shadow-sm" onSubmit={(event) => { event.preventDefault(); createCounter() }}><label htmlFor="new-counter" className="sr-only">Counter name</label><input id="new-counter" autoFocus value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Name your counter" className="min-w-0 flex-1 bg-transparent px-3 outline-none placeholder:text-muted-foreground" /><button type="submit" className="primary-button">Create</button></form>}<section aria-label="Your counters" className="mt-4 grid gap-3 sm:mt-6 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">{counters.map((counter) => <CounterCard key={counter.id} counter={counter} onPress={beginPress} onRelease={stopRepeating} onRename={renameCounter} onDelete={deleteCounter} evidence={evidenceByCounter[counter.id] ?? []} evidenceLoading={Boolean(evidenceLoading[counter.id])} evidenceUploading={Boolean(evidenceUploading[counter.id])} evidenceError={evidenceError[counter.id] ?? ''} onLoadEvidence={() => void loadEvidence(counter.id)} onUploadEvidence={(file) => uploadEvidence(counter.id, file)} onDeleteEvidence={removeEvidence} />)}</section><SettingsPanel open={settingsOpen} preferences={preferences} onClose={() => setSettingsOpen(false)} onChange={updatePreferences} /></main>
}
