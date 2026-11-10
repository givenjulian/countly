'use client'

import { Minus, Plus } from 'lucide-react'
import { useRef } from 'react'
import { cn } from '@/lib/utils'

export function CounterControl({ delta, onPress, onRelease, label, detail = false }: { delta: 1 | -1; onPress: () => void; onRelease: () => void; label: string; detail?: boolean }) {
  const moved = useRef(false)
  const Icon = delta > 0 ? Plus : Minus
  return (
    <button
      type="button"
      aria-label={label}
      className={cn('counter-action touch-none select-none', detail && 'counter-action-detail')}
      onPointerDown={(event) => { moved.current = false; event.currentTarget.setPointerCapture(event.pointerId); onPress() }}
      onPointerUp={() => { moved.current = true; onRelease() }}
      onPointerCancel={onRelease}
      onPointerLeave={() => { if (moved.current) onRelease() }}
      onContextMenu={(event) => event.preventDefault()}
    >
      <Icon aria-hidden="true" strokeWidth={2.5} />
    </button>
  )
}
