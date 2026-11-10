import { redirect } from 'next/navigation'
import { ChangePasswordForm } from '@/components/auth/change-password-form'
import { createClient } from '@/lib/supabase/server'

export default async function ChangePasswordPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return <main className="flex min-h-screen items-center justify-center bg-background p-6"><ChangePasswordForm /></main>
}
