'use client'

import { FormEvent, useState } from 'react'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (signInError) {
      setError(signInError.message.toLowerCase().includes('email not confirmed') ? 'Email kamu belum dikonfirmasi.' : 'Email atau password tidak valid.')
      setLoading(false)
      return
    }
    window.location.href = new URLSearchParams(window.location.search).get('next') || '/'
  }

  return <main className="flex min-h-screen items-center justify-center px-4 py-8"><section className="w-full max-w-md rounded-[2rem] border border-border bg-card p-6 shadow-xl sm:p-8"><div className="mb-8"><div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><LockKeyhole className="size-5" aria-hidden="true" /></div><p className="eyebrow">Welcome back</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Sign in to Counterly</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Masuk untuk menyimpan counter dan bukti gambar kamu di Supabase.</p></div><form className="space-y-4" onSubmit={submit}><label className="block"><span className="mb-2 block text-sm font-medium">Email</span><span className="relative block"><Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><input className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 outline-none transition focus:border-primary" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></span></label><label className="block"><span className="mb-2 block text-sm font-medium">Password</span><span className="relative block"><input className="h-11 w-full rounded-xl border border-border bg-background px-3 pr-11 outline-none transition focus:border-primary" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></span></label>{error && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">{error}</p>}<button className="primary-button h-11 w-full justify-center" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}{!loading && <ArrowRight data-icon="inline-end" />}</button></form></section></main>
}
