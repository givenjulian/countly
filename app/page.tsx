import { AuthGate } from '@/components/auth/auth-gate'
import { CounterApp } from '@/components/counter-app'

export default function Page() {
  return <AuthGate><CounterApp /></AuthGate>
}
