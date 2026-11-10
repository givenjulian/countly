import { Counter, CounterPreferences, CounterSession, DEFAULT_COUNTERS, DEFAULT_PREFERENCES } from './counter-types'

const SESSIONS_KEY = 'counterly:sessions:v2'
const ACTIVE_SESSION_KEY = 'counterly:active-session:v2'
const PREFERENCES_KEY = 'counterly:preferences:v1'

export interface CounterRepository {
  loadSessions(): CounterSession[]
  saveSessions(sessions: CounterSession[]): void
  loadActiveSessionId(): string | null
  saveActiveSessionId(id: string): void
  loadPreferences(): CounterPreferences
  savePreferences(preferences: CounterPreferences): void
}

const initialSession = (): CounterSession => ({
  id: crypto.randomUUID(),
  name: 'Session 1 · Barang masuk',
  counters: DEFAULT_COUNTERS,
  createdAt: Date.now(),
  updatedAt: Date.now(),
})

export const localStorageRepository: CounterRepository = {
  loadSessions() {
    if (typeof window === 'undefined') return []
    try {
      const stored = window.localStorage.getItem(SESSIONS_KEY)
      if (stored) return JSON.parse(stored) as CounterSession[]
      const legacy = window.localStorage.getItem('counterly:counters:v1')
      const session = initialSession()
      if (legacy) session.counters = JSON.parse(legacy) as Counter[]
      this.saveSessions([session])
      this.saveActiveSessionId(session.id)
      return [session]
    } catch {
      const session = initialSession()
      return [session]
    }
  },
  saveSessions(sessions) {
    window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
  },
  loadActiveSessionId() {
    return window.localStorage.getItem(ACTIVE_SESSION_KEY)
  },
  saveActiveSessionId(id) {
    window.localStorage.setItem(ACTIVE_SESSION_KEY, id)
  },
  loadPreferences() {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES
    try {
      const value = window.localStorage.getItem(PREFERENCES_KEY)
      return value ? { ...DEFAULT_PREFERENCES, ...JSON.parse(value) } : DEFAULT_PREFERENCES
    } catch {
      return DEFAULT_PREFERENCES
    }
  },
  savePreferences(preferences) {
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
  },
}
