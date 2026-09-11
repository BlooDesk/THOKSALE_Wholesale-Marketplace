'use client'

import { useEffect, useState } from 'react'

type Props = {
  targetDate: Date
  label?: string
}

export function DealTimer({ targetDate, label = 'Deal ends in' }: Props) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const tick = () => {
      const diff = Math.max(0, targetDate.getTime() - Date.now())
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1000)
      setTimeLeft({ h, m, s })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [targetDate])

  if (!mounted) return null

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{label}</span>
      {[timeLeft.h, timeLeft.m, timeLeft.s].map((v, i) => (
        <span key={i} className="flex items-center gap-0.5">
          <span className="bg-[#0F172A] dark:bg-slate-700 text-white text-[13px] font-black tabular-nums px-1.5 py-0.5 rounded-md min-w-[28px] text-center">
            {pad(v)}
          </span>
          {i < 2 && <span className="text-[#B5924D] font-black text-sm">:</span>}
        </span>
      ))}
    </div>
  )
}
