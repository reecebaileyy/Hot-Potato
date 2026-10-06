import React from 'react'
import { Button, Input } from './ui'

interface PassPotatoFormProps {
  hasPotato: boolean
  /** Seconds left on the fuse, or null if unknown. */
  countdown: number | null
  busy: boolean
  onPassPotato: (toTokenId: number) => void
  /** The typed hand id. Lifted so the hero form and the mobile bar share it. */
  value: string
  onChange: (value: string) => void
  /** Single-row layout for the fixed mobile bar. */
  compact?: boolean
}

/** "Pass to hand #" input and button. Disabled unless the player holds the potato. */
export default function PassPotatoForm({
  hasPotato,
  countdown,
  busy,
  onPassPotato,
  value,
  onChange,
  compact = false,
}: PassPotatoFormProps) {
  const fuseOut = hasPotato && countdown === 0

  const hint = !hasPotato
    ? "You don't have the potato."
    : fuseOut
      ? 'The fuse has run out: passing now explodes the potato in your hands.'
      : 'Pass it to another hand before the fuse runs out.'

  return (
    <form
      className={compact ? 'space-y-2' : 'space-y-3'}
      onSubmit={(e) => {
        e.preventDefault()
        onPassPotato(Number(value))
      }}
    >
      {compact ? (
        <p className="flex items-center justify-between gap-3 text-[13px] leading-5 text-fg-secondary">
          <span className="min-w-0 truncate font-medium text-fg">
            {hasPotato ? 'You hold the potato' : "You don't have the potato"}
          </span>
          {countdown !== null && (
            <span className={`shrink-0 tnum ${fuseOut ? 'text-danger' : ''}`}>{countdown}s left</span>
          )}
        </p>
      ) : (
        <div>
          <h3 className="text-[17px] leading-6 font-semibold">Pass the potato</h3>
          <p className={`mt-0.5 text-[13px] leading-5 ${fuseOut ? 'text-danger' : 'text-fg-secondary'}`}>{hint}</p>
        </div>
      )}

      <div className="flex gap-2">
        <div className="min-w-0 flex-1">
          <Input
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            placeholder="Hand # to pass to"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={!hasPotato}
            aria-label="Hand to pass to"
            className="h-12 rounded-2xl"
          />
        </div>
        <Button type="submit" size="lg" disabled={!hasPotato || busy}>
          {hasPotato ? 'Pass' : 'Need potato'}
        </Button>
      </div>
    </form>
  )
}
