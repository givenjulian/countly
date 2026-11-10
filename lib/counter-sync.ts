import { createClient } from '@/lib/supabase/client'
import type { CounterSession } from '@/lib/counter-types'
import { localStorageRepository } from '@/lib/counter-storage'

export async function requireUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Authentication required')
  return user
}

export async function syncSessionToSupabase(session: CounterSession) {
  const supabase = createClient()
  const user = await requireUser()
  const { error } = await supabase.from('counter_sessions').upsert({
    id: session.id,
    owner_id: user.id,
    name: session.name,
    counters: session.counters,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' })
  if (error) throw error
}

export async function mergeLocalSessions() {
  if (typeof window === 'undefined') return
  const supabase = createClient()
  const user = await requireUser()
  const localSessions = localStorageRepository.loadSessions()
  const savedActive = localStorageRepository.loadActiveSessionId()
  const { data: remoteRows, error: fetchError } = await supabase.from('counter_sessions').select('id, name, counters, updated_at').order('updated_at', { ascending: false })
  if (fetchError) throw fetchError

  const remoteSessions = (remoteRows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    counters: row.counters,
    createdAt: Date.parse(row.updated_at),
    updatedAt: Date.parse(row.updated_at),
  })) as CounterSession[]
  const remoteById = new Map(remoteSessions.map((session) => [session.id, session]))
  const mergedById = new Map(remoteSessions.map((session) => [session.id, session]))

  for (const local of localSessions) {
    const remote = remoteById.get(local.id)
    if (remote) {
      if (local.updatedAt > remote.updatedAt) {
        await syncSessionToSupabase(local)
        mergedById.set(local.id, { ...local, syncedAt: Date.now() })
      }
      continue
    }
    const session = { ...local, id: crypto.randomUUID() }
    await supabase.from('counter_sessions').upsert({ id: session.id, owner_id: user.id, name: session.name, counters: session.counters, updated_at: new Date(session.updatedAt).toISOString() }, { onConflict: 'id' })
    mergedById.set(session.id, { ...session, syncedAt: Date.now() })
  }

  const merged = Array.from(mergedById.values())
  localStorageRepository.saveSessions(merged)
  const nextActive = savedActive && merged.some((session) => session.id === savedActive) ? savedActive : merged[0]?.id
  if (nextActive) localStorageRepository.saveActiveSessionId(nextActive)
  window.dispatchEvent(new Event('counterly:auth-merge'))
}
