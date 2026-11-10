'use client'

import { Moon, Settings, Sun, Volume2, VolumeX, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { CounterPreferences } from '@/lib/counter-types'

export function SettingsPanel({ open, preferences, onClose, onChange }: { open: boolean; preferences: CounterPreferences; onClose: () => void; onChange: (next: Partial<CounterPreferences>) => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/20 p-3 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <button className="absolute inset-0 cursor-default" aria-label="Close settings" onClick={onClose} />
      <section className="relative w-full max-w-md rounded-[2rem] border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-2xl bg-secondary"><Settings aria-hidden="true" /></span><h2 id="settings-title" className="text-xl font-semibold">Settings</h2></div>
          <button type="button" onClick={onClose} className="icon-button" aria-label="Close settings"><X aria-hidden="true" /></button>
        </div>
        <div className="mt-8 flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4"><div><p className="font-medium">Click sound</p><p className="text-sm text-muted-foreground">Play a sound on every tap</p></div><button type="button" className="icon-button" aria-label={preferences.soundEnabled ? 'Mute click sound' : 'Enable click sound'} onClick={() => onChange({ soundEnabled: !preferences.soundEnabled })}>{preferences.soundEnabled ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}</button></div>
          <div><p className="font-medium">Appearance</p><div className="mt-3 grid grid-cols-3 gap-2 rounded-2xl bg-secondary p-1"><ThemeButton active={preferences.theme === 'light'} onClick={() => onChange({ theme: 'light' })} icon={<Sun aria-hidden="true" />} label="Light" /><ThemeButton active={preferences.theme === 'system'} onClick={() => onChange({ theme: 'system' })} icon={<Settings aria-hidden="true" />} label="System" /><ThemeButton active={preferences.theme === 'dark'} onClick={() => onChange({ theme: 'dark' })} icon={<Moon aria-hidden="true" />} label="Dark" /></div></div>
        </div>
      </section>
    </div>
  )
}

function ThemeButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return <button type="button" onClick={onClick} className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-medium transition-colors ${active ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>{icon}<span>{label}</span></button>
}
