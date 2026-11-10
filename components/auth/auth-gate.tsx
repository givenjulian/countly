'use client'

import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { LoginForm } from './login-form'
import { mergeLocalSessions } from '@/lib/counter-sync'

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session)
        setReady(true)
      }
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setReady(true)
    })
    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session) return
    void mergeLocalSessions().catch(() => undefined)
  }, [session])

  if (!ready) return <main className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading...</main>
  if (!session) return <LoginForm />
  return <>{children}</>
}
