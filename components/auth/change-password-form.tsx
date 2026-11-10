'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function ChangePasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setStatus('')
    if (password.length < 8) return setError('Password minimal 8 karakter.')
    if (password !== confirmation) return setError('Konfirmasi password tidak sama.')
    setLoading(true)
    const { error: updateError } = await createClient().auth.updateUser({ password })
    setLoading(false)
    if (updateError) return setError('Password belum dapat diubah. Coba lagi.')
    setPassword('')
    setConfirmation('')
    setStatus('Password berhasil diubah.')
  }

  return <form onSubmit={submit} className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-2xl border border-foreground/15 bg-background/70 p-6 shadow-xl">
    <div><h1 className="text-2xl font-semibold">Ubah password</h1><p className="mt-1 text-sm opacity-65">Gunakan password baru untuk akunmu.</p></div>
    <label className="flex flex-col gap-2 text-sm font-medium">Password baru<input type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 rounded-xl border border-foreground/15 bg-background px-3 outline-none focus:border-foreground/50" autoComplete="new-password" /></label>
    <label className="flex flex-col gap-2 text-sm font-medium">Konfirmasi password<input type="password" minLength={8} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="h-11 rounded-xl border border-foreground/15 bg-background px-3 outline-none focus:border-foreground/50" autoComplete="new-password" /></label>
    {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
    {status && <p role="status" className="text-sm text-emerald-500">{status}</p>}
    <button type="submit" disabled={loading} className="h-11 rounded-xl bg-foreground px-4 text-sm font-semibold text-background disabled:opacity-50">{loading ? 'Menyimpan...' : 'Simpan password'}</button>
    <Link href="/" className="text-center text-sm font-medium opacity-70 hover:opacity-100">Kembali ke counter</Link>
  </form>
}
