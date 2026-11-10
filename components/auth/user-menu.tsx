'use client'

import { KeyRound, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function UserMenu() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ''))
  }, [])

  async function signOut() {
    setLoading(true)
    await createClient().auth.signOut()
    window.location.href = '/login'
  }

  return <div className="flex items-center gap-2"><span className="hidden max-w-36 truncate text-xs text-muted-foreground sm:inline" title={email}>{email}</span><a href="/change-password" className="icon-button" aria-label="Change password" title="Change password"><KeyRound aria-hidden="true" /></a><button type="button" className="icon-button" onClick={signOut} disabled={loading} aria-label="Sign out" title="Sign out"><LogOut aria-hidden="true" /></button></div>
}
