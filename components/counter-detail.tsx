'use client'

import Link from 'next/link'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import { COLOR_STYLES } from '@/lib/counter-types'
import { useCounters } from '@/hooks/use-counters'
import { AnimatedNumber } from './animated-number'
import { CounterControl } from './counter-control'
import { CounterEvidenceGallery } from './counter-evidence'

export function CounterDetail({ id }: { id: string }) {
  const { counters, beginPress, stopRepeating, resetCounter, evidenceByCounter, evidenceLoading, evidenceUploading, evidenceError, loadEvidence, uploadEvidence, removeEvidence } = useCounters()
  const counter = counters.find((item) => item.id === id)
  if (!counter) return <main className="flex min-h-screen items-center justify-center p-6"><div className="text-center"><p className="text-lg font-medium">Counter not found</p><Link href="/" className="mt-4 inline-block text-sm text-muted-foreground underline">Back to counters</Link></div></main>
  const style = COLOR_STYLES[counter.color]
  const confirmReset = () => {
    if (window.confirm(`Reset counter “${counter.name}” ke 0?`)) resetCounter(counter.id)
  }
  return <main className={`flex min-h-screen flex-col ${style.surface}`}><header className="flex items-center justify-between px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-8"><Link href="/" className="icon-button" aria-label="Back to counters"><ArrowLeft aria-hidden="true" /></Link><span className="max-w-[55vw] truncate text-sm font-semibold opacity-80">{counter.name}</span><button type="button" className="icon-button" onClick={confirmReset} aria-label={`Reset ${counter.name}`}><RotateCcw aria-hidden="true" /></button></header><section className="flex flex-1 flex-col items-center justify-center px-6 pb-40 pt-8"><p className="eyebrow opacity-60">Current count</p><div className="mt-8"><AnimatedNumber value={counter.value} large /></div><div className="w-full max-w-xl"><CounterEvidenceGallery evidence={evidenceByCounter[counter.id] ?? []} loading={Boolean(evidenceLoading[counter.id])} uploading={Boolean(evidenceUploading[counter.id])} error={evidenceError[counter.id] ?? ''} onLoad={() => void loadEvidence(counter.id)} onUpload={(file) => uploadEvidence(counter.id, file)} onDelete={removeEvidence} /></div></section><footer className="fixed inset-x-0 bottom-0 flex gap-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:gap-5 sm:px-8"><CounterControl delta={-1} detail label={`Decrease ${counter.name}`} onPress={() => beginPress(counter.id, -1)} onRelease={stopRepeating} /><CounterControl delta={1} detail label={`Increase ${counter.name}`} onPress={() => beginPress(counter.id, 1)} onRelease={stopRepeating} /></footer></main>
}
