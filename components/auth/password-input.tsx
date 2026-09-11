'use client'

import { useState, useMemo } from 'react'

type Strength = { score: 0 | 1 | 2 | 3 | 4; label: string; color: string }

function getStrength(password: string): Strength {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const map: Strength[] = [
    { score: 0, label: '', color: '' },
    { score: 1, label: 'Weak', color: 'bg-rose-500' },
    { score: 2, label: 'Fair', color: 'bg-amber-500' },
    { score: 3, label: 'Good', color: 'bg-emerald-500' },
    { score: 4, label: 'Strong', color: 'bg-emerald-600' },
  ]
  return map[score as 0 | 1 | 2 | 3 | 4]
}

interface PasswordInputProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  showStrength?: boolean
  id?: string
  name?: string
  autoComplete?: string
  required?: boolean
}

export function PasswordInput({
  value,
  onChange,
  placeholder = '••••••••',
  showStrength = false,
  id,
  name,
  autoComplete = 'current-password',
  required = false,
}: PasswordInputProps) {
  const [show, setShow] = useState(false)
  const strength = useMemo(() => getStrength(value), [value])

  return (
    <div className="space-y-2">
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
          lock
        </span>
        <input
          id={id}
          name={name}
          type={show ? 'text' : 'password'}
          required={required}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-[#0F172A] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#B5924D]/40 focus:border-[#B5924D] transition-all"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((s) => !s)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          <span className="material-symbols-outlined text-[18px]">
            {show ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      </div>

      {/* Strength meter */}
      {showStrength && value.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  strength.score >= i ? strength.color : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
          {strength.label && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Password strength</span>
              <span
                className={`font-bold ${
                  strength.score === 1
                    ? 'text-rose-500'
                    : strength.score === 2
                    ? 'text-amber-500'
                    : 'text-emerald-600'
                }`}
              >
                {strength.label}
              </span>
            </div>
          )}
          {/* Requirement checklist */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 pt-1">
            {[
              { rule: value.length >= 8, label: '8+ characters' },
              { rule: /[A-Z]/.test(value), label: 'Uppercase letter' },
              { rule: /[0-9]/.test(value), label: 'Number' },
              { rule: /[^A-Za-z0-9]/.test(value), label: 'Special character' },
            ].map(({ rule, label }) => (
              <div key={label} className={`flex items-center gap-1 text-[10px] font-semibold transition-colors ${rule ? 'text-emerald-600' : 'text-slate-400'}`}>
                <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {rule ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                {label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
