export type CounterColor = 'coral' | 'violet' | 'teal' | 'amber' | 'blue' | 'pink'

export type Counter = {
  id: string
  name: string
  value: number
  color: CounterColor
  createdAt: number
}

export type CounterSession = {
  id: string
  name: string
  counters: Counter[]
  createdAt: number
  updatedAt: number
  syncedAt?: number
}

export type CounterPreferences = {
  soundEnabled: boolean
  theme: 'system' | 'light' | 'dark'
}

export const COLOR_STYLES: Record<CounterColor, { surface: string; accent: string; soft: string }> = {
  coral: { surface: 'bg-counter-coral', accent: 'text-counter-coral-foreground', soft: 'bg-counter-coral-soft' },
  violet: { surface: 'bg-counter-violet', accent: 'text-counter-violet-foreground', soft: 'bg-counter-violet-soft' },
  teal: { surface: 'bg-counter-teal', accent: 'text-counter-teal-foreground', soft: 'bg-counter-teal-soft' },
  amber: { surface: 'bg-counter-amber', accent: 'text-counter-amber-foreground', soft: 'bg-counter-amber-soft' },
  blue: { surface: 'bg-counter-blue', accent: 'text-counter-blue-foreground', soft: 'bg-counter-blue-soft' },
  pink: { surface: 'bg-counter-pink', accent: 'text-counter-pink-foreground', soft: 'bg-counter-pink-soft' },
}

export const DEFAULT_COUNTERS: Counter[] = [
  { id: 'water', name: 'Water glasses', value: 6, color: 'teal', createdAt: 1 },
  { id: 'reading', name: 'Reading minutes', value: 42, color: 'violet', createdAt: 2 },
  { id: 'pushups', name: 'Push-ups', value: 18, color: 'coral', createdAt: 3 },
  { id: 'tasks', name: 'Tasks done', value: 9, color: 'amber', createdAt: 4 },
]

export const DEFAULT_PREFERENCES: CounterPreferences = { soundEnabled: true, theme: 'system' }
