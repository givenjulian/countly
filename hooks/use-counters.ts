'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Counter, CounterPreferences, CounterSession, DEFAULT_PREFERENCES } from '@/lib/counter-types'
import { localStorageRepository } from '@/lib/counter-storage'
import { syncSessionToSupabase } from '@/lib/counter-sync'
import { CounterEvidence, deleteCounterEvidence, listCounterEvidence, uploadCounterEvidence } from '@/lib/counter-evidence'

const LONG_PRESS_DELAY = 360
const REPEAT_INTERVAL = 90

export function useCounters() {
  const [sessions, setSessions] = useState<CounterSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState('')
  const [preferences, setPreferences] = useState<CounterPreferences>(DEFAULT_PREFERENCES)
  const [hydrated, setHydrated] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState('')
  const [evidenceByCounter, setEvidenceByCounter] = useState<Record<string, CounterEvidence[]>>({})
  const [evidenceLoading, setEvidenceLoading] = useState<Record<string, boolean>>({})
  const [evidenceUploading, setEvidenceUploading] = useState<Record<string, boolean>>({})
  const [evidenceError, setEvidenceError] = useState<Record<string, string>>({})
  const [creatingSession, setCreatingSession] = useState(false)
  const repeatTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const activeSession = sessions.find((session) => session.id === activeSessionId) ?? sessions[0]
  const counters = activeSession?.counters ?? []

  useEffect(() => {
    const loadLocalState = () => {
      const loaded = localStorageRepository.loadSessions()
      const savedActive = localStorageRepository.loadActiveSessionId()
      setSessions(loaded)
      setActiveSessionId(savedActive && loaded.some((session) => session.id === savedActive) ? savedActive : loaded[0]?.id ?? '')
      setPreferences(localStorageRepository.loadPreferences())
    }
    loadLocalState()
    setHydrated(true)
    audioRef.current = new Audio('/meme-click.mp3')
    audioRef.current.preload = 'auto'
    window.addEventListener('counterly:auth-merge', loadLocalState)
    return () => {
      window.removeEventListener('counterly:auth-merge', loadLocalState)
      stopRepeating()
    }
  }, [])

  useEffect(() => {
    if (hydrated) localStorageRepository.saveSessions(sessions)
  }, [sessions, hydrated])

  useEffect(() => {
    if (hydrated && activeSessionId) localStorageRepository.saveActiveSessionId(activeSessionId)
  }, [activeSessionId, hydrated])

  useEffect(() => {
    if (hydrated) localStorageRepository.savePreferences(preferences)
  }, [preferences, hydrated])

  const updateActive = useCallback((update: (session: CounterSession) => CounterSession) => {
    setSessions((current) => current.map((session) => session.id === activeSessionId ? update(session) : session))
  }, [activeSessionId])

  const tick = useCallback((id: string, delta: number) => {
    updateActive((session) => ({ ...session, counters: session.counters.map((counter) => counter.id === id ? { ...counter, value: Math.max(0, counter.value + delta) } : counter), updatedAt: Date.now(), syncedAt: undefined }))
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(8)
    if (preferences.soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0
      void audioRef.current.play().catch(() => undefined)
    }
  }, [preferences.soundEnabled, updateActive])

  const stopRepeating = useCallback(() => {
    if (holdTimer.current) clearTimeout(holdTimer.current)
    if (repeatTimer.current) clearInterval(repeatTimer.current)
    holdTimer.current = null
    repeatTimer.current = null
  }, [])

  const beginPress = useCallback((id: string, delta: number) => {
    tick(id, delta)
    holdTimer.current = setTimeout(() => {
      repeatTimer.current = setInterval(() => tick(id, delta), REPEAT_INTERVAL)
    }, LONG_PRESS_DELAY)
  }, [tick])

  const resetCounter = useCallback((id: string) => updateActive((session) => ({ ...session, counters: session.counters.map((counter) => counter.id === id ? { ...counter, value: 0 } : counter), updatedAt: Date.now(), syncedAt: undefined })), [updateActive])

  const deleteCounter = useCallback((id: string) => updateActive((session) => ({ ...session, counters: session.counters.filter((counter) => counter.id !== id), updatedAt: Date.now(), syncedAt: undefined })), [updateActive])

  const renameCounter = useCallback((id: string, name: string) => {
    const nextName = name.trim()
    if (!nextName) return
    updateActive((session) => ({ ...session, counters: session.counters.map((counter) => counter.id === id ? { ...counter, name: nextName } : counter), updatedAt: Date.now(), syncedAt: undefined }))
  }, [updateActive])

  const addCounter = useCallback((name: string) => {
    const colors = ['blue', 'pink', 'teal', 'violet', 'coral', 'amber'] as const
    updateActive((session) => ({ ...session, counters: [...session.counters, { id: crypto.randomUUID(), name: name.trim() || 'New counter', value: 0, color: colors[session.counters.length % colors.length], createdAt: Date.now() }], updatedAt: Date.now(), syncedAt: undefined }))
  }, [updateActive])

  const createSession = useCallback(async (name: string) => {
    if (creatingSession) return
    const session: CounterSession = { id: crypto.randomUUID(), name: name.trim() || `Session ${sessions.length + 1}`, counters: [], createdAt: Date.now(), updatedAt: Date.now() }
    setCreatingSession(true)
    setSyncError('')
    try {
      await syncSessionToSupabase(session)
      const syncedSession = { ...session, syncedAt: Date.now() }
      setSessions((current) => [...current, syncedSession])
      setActiveSessionId(session.id)
    } catch (error) {
      setSyncError(error instanceof Error && error.message === 'Anonymous sign-ins are disabled' ? 'Aktifkan Anonymous Sign-ins di Supabase terlebih dulu.' : 'Session baru gagal dibuat di Supabase.')
    } finally {
      setCreatingSession(false)
    }
  }, [creatingSession, sessions.length])

  const switchSession = useCallback((id: string) => setActiveSessionId(id), [])

  const renameSession = useCallback((name: string) => updateActive((session) => ({ ...session, name: name.trim() || session.name, updatedAt: Date.now(), syncedAt: undefined })), [updateActive])

  const syncActiveSession = useCallback(async () => {
    if (!activeSession) return
    setSyncing(true)
    setSyncError('')
    try {
      await syncSessionToSupabase(activeSession)
      setSessions((current) => current.map((session) => session.id === activeSession.id ? { ...session, syncedAt: Date.now() } : session))
    } catch (error) {
      setSyncError(error instanceof Error && error.message === 'Anonymous sign-ins are disabled' ? 'Aktifkan Anonymous Sign-ins di Supabase terlebih dulu.' : 'Update gagal. Coba lagi saat koneksi lebih baik.')
    } finally {
      setSyncing(false)
    }
  }, [activeSession])

  const loadEvidence = useCallback(async (counterId: string) => {
    setEvidenceLoading((current) => ({ ...current, [counterId]: true }))
    setEvidenceError((current) => ({ ...current, [counterId]: '' }))
    try {
      const items = await listCounterEvidence(counterId)
      setEvidenceByCounter((current) => ({ ...current, [counterId]: items }))
    } catch {
      setEvidenceError((current) => ({ ...current, [counterId]: 'Bukti belum bisa dimuat.' }))
    } finally {
      setEvidenceLoading((current) => ({ ...current, [counterId]: false }))
    }
  }, [])

  const uploadEvidence = useCallback(async (counterId: string, file: File) => {
    setEvidenceUploading((current) => ({ ...current, [counterId]: true }))
    setEvidenceError((current) => ({ ...current, [counterId]: '' }))
    try {
      const item = await uploadCounterEvidence(counterId, file)
      setEvidenceByCounter((current) => ({ ...current, [counterId]: [item, ...(current[counterId] ?? [])] }))
    } catch (error) {
      setEvidenceError((current) => ({ ...current, [counterId]: error instanceof Error ? error.message : 'Upload gagal.' }))
      throw error
    } finally {
      setEvidenceUploading((current) => ({ ...current, [counterId]: false }))
    }
  }, [])

  const removeEvidence = useCallback(async (item: CounterEvidence) => {
    await deleteCounterEvidence(item)
    setEvidenceByCounter((current) => ({ ...current, [item.counterId]: (current[item.counterId] ?? []).filter((evidence) => evidence.id !== item.id) }))
  }, [])

  const updatePreferences = useCallback((next: Partial<CounterPreferences>) => setPreferences((current) => ({ ...current, ...next })), [])

  return { sessions, activeSession, activeSessionId, counters, preferences, hydrated, syncing, creatingSession, syncError, beginPress, stopRepeating, resetCounter, deleteCounter, renameCounter, addCounter, createSession, switchSession, renameSession, syncActiveSession, updatePreferences, evidenceByCounter, evidenceLoading, evidenceUploading, evidenceError, loadEvidence, uploadEvidence, removeEvidence }
}
