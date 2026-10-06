import React, { useState } from 'react'
import { formatEther, parseEther } from 'viem'
import { Badge, Button, Card, CardHeader, Field, Input, SectionHeader, Segmented, buttonClasses } from './ui'
import { GameState, gameStateLabel } from '../lib/game'
import { seedFileName } from '../lib/seed'
import type { AdminActions, FuseConfigInput, MintConfigInput, PayeesInput } from '../hooks/useAdminActions'
import type { GameInfo } from '../hooks/useGame'

interface AdminControlsProps {
  admin: AdminActions
  info: GameInfo | undefined
  busy: boolean
}

const SOURCE_LABELS = { browser: 'this browser', file: 'the uploaded file', paste: 'the pasted seed' } as const

type NoteTone = 'neutral' | 'success' | 'warning' | 'danger'

/** A short status line led by a tone badge, used for seed and storage notices. */
function Note({ tone, label, children }: { tone: NoteTone; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-[13px] leading-5 text-fg-secondary">
      <Badge tone={tone} className="shrink-0">
        {label}
      </Badge>
      <span className="min-w-0 break-words pt-0.5">{children}</span>
    </div>
  )
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="block mb-1.5 text-[13px] font-medium text-fg-secondary">{label}</span>
      {children}
    </div>
  )
}

function Lede({ children }: { children: React.ReactNode }) {
  return <p className="text-[15px] leading-6 text-fg-secondary">{children}</p>
}

const canStartState = (state: number) => state === GameState.Queued || state === GameState.Ended

/** Lifecycle actions: start, reveal, pause, resume, cancel. */
function RoundCard({ admin, info, busy }: { admin: AdminActions; info: GameInfo; busy: boolean }) {
  const state = info.state
  const canStart = canStartState(state)
  const canPause = state === GameState.Minting || state === GameState.Playing || state === GameState.FinalRound
  const canCancel = !canStart
  const nextRound = admin.nextRound.toString()

  const cancel = () => {
    const ok = window.confirm(
      `Cancel round ${admin.round}? There will be no winner and its pot rolls over into the next round.`,
    )
    if (ok) void admin.cancelRound()
  }

  return (
    <Card>
      <CardHeader
        title="Round"
        subtitle={`Round ${info.round.toString()}`}
        action={<Badge tone={canPause ? 'accent' : 'neutral'}>{gameStateLabel(state)}</Badge>}
      />
      <div className="space-y-4">
        {canStart && (
          <Lede>
            Starting round {nextRound} commits to the secret seed from the Seed section below.{' '}
            {admin.nextRoundSeed ? 'The seed is ready.' : 'Generate it first.'}
          </Lede>
        )}
        {state === GameState.Minting && (
          <Lede>
            Revealing the seed closes minting and starts play.{' '}
            {admin.seedStatus === 'match'
              ? 'The seed matches the on-chain commitment.'
              : 'Load the seed for this round in the Seed section first.'}
          </Lede>
        )}
        {state === GameState.Paused && <Lede>The game is paused. Resume to let the fuse burn again.</Lede>}

        <div className="flex flex-wrap gap-2">
          {canStart && (
            <Button onClick={() => void admin.startRound()} disabled={busy || !admin.nextRoundSeed}>
              Start round {nextRound}
            </Button>
          )}
          {state === GameState.Minting && (
            <Button onClick={() => void admin.endMinting()} disabled={busy || admin.seedStatus !== 'match'}>
              Reveal seed and start play
            </Button>
          )}
          {canPause && (
            <Button variant="secondary" onClick={() => void admin.pauseGame()} disabled={busy}>
              Pause
            </Button>
          )}
          {state === GameState.Paused && (
            <Button onClick={() => void admin.resumeGame()} disabled={busy}>
              Resume
            </Button>
          )}
          {canCancel && (
            <Button variant="danger" onClick={cancel} disabled={busy}>
              Cancel round
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

/** Seed material: generate/download before a round, load/paste and verify while minting. */
function SeedCard({ admin, info, busy }: { admin: AdminActions; info: GameInfo; busy: boolean }) {
  const [pasted, setPasted] = useState('')
  const state = info.state
  const round = admin.round.toString()

  if (canStartState(state)) {
    const seed = admin.nextRoundSeed
    const nextRound = admin.nextRound.toString()
    return (
      <Card>
        <CardHeader
          title="Seed"
          subtitle={`For round ${nextRound}`}
          action={
            seed ? (
              <Badge tone="success" dot>
                Ready
              </Badge>
            ) : (
              <Badge tone="neutral">Not generated</Badge>
            )
          }
        />
        <div className="space-y-4">
          <Lede>
            The seed is generated in this browser, saved here and downloaded as{' '}
            <code className="font-mono text-[13px]">{seedFileName(nextRound)}</code>. You need it to end minting:
            without it the round can only be cancelled.
          </Lede>
          {seed ? (
            <>
              <Card variant="inset">
                <div className="text-[12px] leading-4 font-medium uppercase tracking-wide text-fg-secondary">
                  Commitment for round {seed.round}
                </div>
                <div className="mt-1 break-all font-mono text-[13px] leading-5">{seed.commitment}</div>
              </Card>
              {admin.storageFailed && (
                <Note tone="danger" label="Not saved">
                  This browser could not store the seed. Keep the downloaded file safe; it is the only copy.
                </Note>
              )}
              <Button variant="secondary" onClick={() => admin.downloadSeed(seed)}>
                Download seed again
              </Button>
            </>
          ) : (
            <Button onClick={admin.prepareRound} disabled={busy}>
              Generate and download seed
            </Button>
          )}
        </div>
      </Card>
    )
  }

  if (state !== GameState.Minting) return null

  const statusBadge =
    admin.seedStatus === 'match' ? (
      <Badge tone="success" dot>
        Verified
      </Badge>
    ) : admin.seedStatus === 'mismatch' ? (
      <Badge tone="danger">Mismatch</Badge>
    ) : (
      <Badge tone="warning">Missing</Badge>
    )

  return (
    <Card>
      <CardHeader title="Seed" subtitle={`For round ${round}`} action={statusBadge} />
      <div className="space-y-4">
        {admin.seedStatus === 'missing' && (
          <Note tone="warning" label="Missing">
            No seed for round {round} in this browser. Upload{' '}
            <code className="font-mono">{seedFileName(round)}</code> or paste the seed.
          </Note>
        )}
        {admin.seedStatus === 'match' && admin.seedSource && (
          <Note tone="success" label="Match">
            Seed from {SOURCE_LABELS[admin.seedSource]} matches the on-chain commitment for round {round}.
          </Note>
        )}
        {admin.seedStatus === 'mismatch' && (
          <Note tone="danger" label="Mismatch">
            The seed from {admin.seedSource ? SOURCE_LABELS[admin.seedSource] : 'storage'} does not match the
            commitment for round {round}. Load the file saved when this round was started.
          </Note>
        )}
        {admin.seedNotice && (
          <Note tone="warning" label="Notice">
            {admin.seedNotice}
          </Note>
        )}
        {admin.seedInputError && (
          <Note tone="danger" label="Error">
            {admin.seedInputError}
          </Note>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Labeled label="Upload seed file">
            <label
              className={buttonClasses({
                variant: 'secondary',
                block: true,
                className: 'cursor-pointer focus-within:outline focus-within:outline-2 focus-within:outline-accent',
              })}
            >
              Choose {seedFileName(round)}
              <input
                type="file"
                accept="application/json,.json"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void admin.loadSeedFile(file)
                  e.target.value = ''
                }}
              />
            </label>
          </Labeled>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              admin.pasteSeed(pasted)
            }}
          >
            <Labeled label="Or paste the seed (0x + 64 hex)">
              <div className="flex gap-2">
                <div className="min-w-0 flex-1">
                  <Input
                    value={pasted}
                    onChange={(e) => setPasted(e.target.value)}
                    placeholder="0x…"
                    spellCheck={false}
                    autoComplete="off"
                    aria-label="Seed hex"
                    className="font-mono"
                  />
                </div>
                <Button type="submit" variant="secondary">
                  Use
                </Button>
              </div>
            </Labeled>
          </form>
        </div>
      </div>
    </Card>
  )
}

function MintConfigForm({
  initial,
  onSubmit,
  busy,
}: {
  initial: { price: bigint; maxPerWallet: number; maxPerRound: number } | undefined
  onSubmit: (input: MintConfigInput) => void
  busy: boolean
}) {
  const [price, setPrice] = useState(initial ? formatEther(initial.price) : '')
  const [maxPerWallet, setMaxPerWallet] = useState(initial ? String(initial.maxPerWallet) : '')
  const [maxPerRound, setMaxPerRound] = useState(initial ? String(initial.maxPerRound) : '')
  const [error, setError] = useState<string | null>(null)

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        try {
          const input = {
            price: parseEther(price || '0'),
            maxPerWallet: Number(maxPerWallet || 0),
            maxPerRound: Number(maxPerRound || 0),
          }
          if (![input.maxPerWallet, input.maxPerRound].every((n) => Number.isInteger(n) && n >= 0 && n < 2 ** 32)) {
            throw new Error('Limits must be whole numbers.')
          }
          setError(null)
          onSubmit(input)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Invalid mint config.')
        }
      }}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label="Price (ETH)">
          <Input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" />
        </Field>
        <Field label="Max per wallet" hint="0 means no limit">
          <Input value={maxPerWallet} onChange={(e) => setMaxPerWallet(e.target.value)} inputMode="numeric" />
        </Field>
        <Field label="Max per round" hint="0 means no limit">
          <Input value={maxPerRound} onChange={(e) => setMaxPerRound(e.target.value)} inputMode="numeric" />
        </Field>
      </div>
      {error && <p className="text-[13px] leading-5 text-danger">{error}</p>}
      <Button type="submit" variant="secondary" disabled={busy}>
        Save mint config
      </Button>
    </form>
  )
}

function FuseConfigForm({
  initial,
  onSubmit,
  busy,
}: {
  initial: FuseConfigInput | undefined
  onSubmit: (input: FuseConfigInput) => void
  busy: boolean
}) {
  const [values, setValues] = useState({
    initial: initial ? String(initial.initial) : '',
    decreaseEvery: initial ? String(initial.decreaseEvery) : '',
    decreaseBy: initial ? String(initial.decreaseBy) : '',
    minimum: initial ? String(initial.minimum) : '',
  })
  const fields: { key: keyof typeof values; label: string; hint?: string }[] = [
    { key: 'initial', label: 'Initial fuse (s)' },
    { key: 'decreaseEvery', label: 'Shorten every N passes', hint: '0 means never' },
    { key: 'decreaseBy', label: 'Shorten by (s)' },
    { key: 'minimum', label: 'Minimum fuse (s)' },
  ]

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({
          initial: Number(values.initial || 0),
          decreaseEvery: Number(values.decreaseEvery || 0),
          decreaseBy: Number(values.decreaseBy || 0),
          minimum: Number(values.minimum || 0),
        })
      }}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fields.map(({ key, label, hint }) => (
          <Field key={key} label={label} hint={hint}>
            <Input
              value={values[key]}
              inputMode="numeric"
              onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
            />
          </Field>
        ))}
      </div>
      <Button type="submit" variant="secondary" disabled={busy}>
        Save fuse config
      </Button>
    </form>
  )
}

/** Read-only view of a config while it cannot be changed. */
function ConfigSummary({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px] leading-5 sm:grid-cols-4">
      {rows.map((row) => (
        <div key={row.label}>
          <dt className="text-fg-secondary">{row.label}</dt>
          <dd className="font-medium tnum">{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}

const CONFIG_TABS = [
  { value: 'mint' as const, label: 'Mint' },
  { value: 'fuse' as const, label: 'Fuse' },
]

/** Mint price and caps, and the fuse, each editable only in the states the contract allows. */
function ConfigCard({ admin, info, busy }: { admin: AdminActions; info: GameInfo; busy: boolean }) {
  const [tab, setTab] = useState<'mint' | 'fuse'>('mint')
  const state = info.state
  const canStart = canStartState(state)
  const { mint, fuse } = admin.currentConfig

  return (
    <Card>
      <CardHeader
        title="Config"
        subtitle="Mint price, caps and the fuse."
        action={<Segmented size="sm" options={CONFIG_TABS} value={tab} onChange={setTab} aria-label="Config section" />}
      />
      {tab === 'mint' ? (
        canStart ? (
          <MintConfigForm
            key={mint ? `${mint.price}-${mint.maxPerWallet}-${mint.maxPerRound}` : 'loading'}
            initial={mint}
            onSubmit={(input) => void admin.setMintConfig(input)}
            busy={busy}
          />
        ) : (
          <div className="space-y-4">
            <Lede>The mint config can be changed while the game is Queued or Ended.</Lede>
            {mint && (
              <ConfigSummary
                rows={[
                  { label: 'Price', value: `${formatEther(mint.price)} ETH` },
                  { label: 'Max per wallet', value: mint.maxPerWallet === 0 ? 'No limit' : String(mint.maxPerWallet) },
                  { label: 'Max per round', value: mint.maxPerRound === 0 ? 'No limit' : String(mint.maxPerRound) },
                ]}
              />
            )}
          </div>
        )
      ) : canStart || state === GameState.Minting ? (
        <FuseConfigForm
          key={fuse ? `${fuse.initial}-${fuse.decreaseEvery}-${fuse.decreaseBy}-${fuse.minimum}` : 'loading'}
          initial={fuse}
          onSubmit={(input) => void admin.setFuseConfig(input)}
          busy={busy}
        />
      ) : (
        <div className="space-y-4">
          <Lede>The fuse can be changed before play starts.</Lede>
          {fuse && (
            <ConfigSummary
              rows={[
                { label: 'Initial', value: `${fuse.initial}s` },
                { label: 'Shorten every', value: fuse.decreaseEvery === 0 ? 'Never' : `${fuse.decreaseEvery} passes` },
                { label: 'Shorten by', value: `${fuse.decreaseBy}s` },
                { label: 'Minimum', value: `${fuse.minimum}s` },
              ]}
            />
          )}
        </div>
      )}
    </Card>
  )
}

function PayeesForm({
  initial,
  onSubmit,
  busy,
}: {
  initial: PayeesInput | undefined
  onSubmit: (input: PayeesInput) => void
  busy: boolean
}) {
  const [values, setValues] = useState<PayeesInput>(initial ?? { project: '', team1: '', team2: '', charity: '' })
  const fields: { key: keyof PayeesInput; label: string }[] = [
    { key: 'project', label: 'Project (10%)' },
    { key: 'team1', label: 'Team wallet 1 (15%)' },
    { key: 'team2', label: 'Team wallet 2 (15%)' },
    { key: 'charity', label: 'Charity (20%)' },
  ]

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(values)
      }}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fields.map(({ key, label }) => (
          <Field key={key} label={label}>
            <Input
              className="font-mono"
              value={values[key]}
              onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
              placeholder="0x…"
              spellCheck={false}
              autoComplete="off"
            />
          </Field>
        ))}
      </div>
      <Button type="submit" variant="secondary" disabled={busy}>
        Save payees
      </Button>
    </form>
  )
}

function PayeesCard({ admin, busy }: { admin: AdminActions; busy: boolean }) {
  const { payees } = admin.currentConfig
  return (
    <Card>
      <CardHeader title="Payees" subtitle="Where the 60% that does not go to the winner is sent." />
      <PayeesForm
        key={payees ? Object.values(payees).join('-') : 'loading'}
        initial={payees}
        onSubmit={(input) => void admin.setPayees(input)}
        busy={busy}
      />
    </Card>
  )
}

/** Owner-only controls, grouped into Round, Seed, Config and Payees. */
export default function AdminControls({ admin, info, busy }: AdminControlsProps) {
  if (!admin.isOwner || !info) return null

  return (
    <section className="space-y-6" aria-label="Admin controls">
      <SectionHeader size="md" eyebrow="Owner" title="Admin" />
      <RoundCard admin={admin} info={info} busy={busy} />
      <SeedCard admin={admin} info={info} busy={busy} />
      <ConfigCard admin={admin} info={info} busy={busy} />
      <PayeesCard admin={admin} busy={busy} />
    </section>
  )
}
