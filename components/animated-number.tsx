'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

export function AnimatedNumber({ value, large = false }: { value: number; large?: boolean }) {
  const reducedMotion = useReducedMotion()
  return (
    <span className="relative inline-flex min-w-[2ch] justify-center tabular-nums" aria-live="polite" aria-atomic="true">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          initial={reducedMotion ? false : { opacity: 0, y: value > 0 ? 12 : -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? undefined : { opacity: 0, y: value > 0 ? -12 : 12 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className={large ? 'text-[clamp(6rem,30vw,15rem)] font-semibold leading-none tracking-[-0.08em]' : 'text-6xl font-semibold leading-none tracking-[-0.06em]'}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
