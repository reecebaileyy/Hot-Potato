import React, { useState } from 'react'
import { formatEther, parseEther } from 'viem'
import { GameState, gameStateLabel } from '../lib/game'
import { seedFileName } from '../lib/seed'
import type { AdminActions, FuseConfigInput, MintConfigInput, PayeesInput } from '../hooks/useAdminActions'
import type { GameInfo } from '../hooks/useGame'

interface AdminControlsProps {
  darkMode: boolean
  admin: AdminActions
  info: GameInfo | undefined
  busy: boolean
}

const SOURCE_LABELS = { browser: 'this browser', file: 'the uploaded file', paste: 'the pasted seed' } as const

function Section({ darkMode, title, children }: { darkMode: boolean; title: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-xl p-5 ${darkMode ? 'bg-gray-800/60' : 'bg-gray-50/80'} space-y-4`}>
      <h3 className="text-xl font-bold text-left">{title}</h3>
      {children}
    </div>
  )
}

function inputClass(darkMode: boolean) {
  return `w-full px-3 py-2 rounded-lg border-2 text-sm focus-ring ${
    darkMode ? 'bg-gray-900 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
  }`
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-left text-sm font-semibold space-y-1">
      <span>{label}</span>
      {children}
    </label>
  )
}

/** Step-by-step commit flow for opening the next round. */
function StartRoundPanel({ darkMode, admin, busy }: { darkMode: boolean; admin: AdminActions; busy: boolean }) {
  const seed = admin.nextRoundSeed
  return (
    <Section darkMode={darkMode} title={`🚀 Start Round ${admin.nextRound}`}>
      <p className="text-sm text-left">
        Starting a round commits to a secret random seed. It is generated in this browser, saved here and
        downloaded as <code>{seedFileName(admin.nextRound)}</code>. You need it to end minting: without it the
        round can only be cancelled.
      </p>
      {!seed ? (
        <button className="btn-primary text-lg py-3 w-full" onClick={admin.prepareRound} disabled={busy}>
          1. Generate &amp; Download Seed
        </button>
      ) : (
        <div className="space-y-3">
          <p className={`text-sm text-left ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
            ✓ Seed for round {seed.round} is ready (commitment <code className="break-all">{seed.commitment}</code>).
          </p>
          {admin.storageFailed && (
            <p className="text-sm text-left text-red-500">
              This browser could not store the seed. Keep the downloaded file safe; it is the only copy.
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button className="btn-outline py-3" onClick={() => admin.downloadSeed(seed)}>
              Download Seed Again
            </button>
            <button className="btn-primary py-3" onClick={() => void admin.startRound()} disabled={busy}>
              2. Start Round {admin.nextRound.toString()}
            </button>
          </div>
        </div>
      )}
    </Section>
  )
}

/** Loads the seed for the current round and reveals it. */
function EndMintingPanel({ darkMode, admin, busy }: { darkMode: boolean; admin: AdminActions; busy: boolean }) {
  const [pasted, setPasted] = useState('')
  const round = admin.round.toString()

  return (
    <Section darkMode={darkMode} title="⏹️ End Minting & Start Play">
      {admin.seedStatus === 'missing' && (
        <p className="text-sm text-left text-amber-500">
          No seed for round {round} in this browser. Upload <code>{seedFileName(round)}</code> or paste the seed.
        </p>
      )}
      {admin.seedStatus === 'match' && admin.seedSource && (
        <p className={`text-sm text-left ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
          ✓ Seed from {SOURCE_LABELS[admin.seedSource]} matches the on-chain commitment for round {round}.
        </p>
      )}
      {admin.seedStatus === 'mismatch' && (
        <p className="text-sm text-left text-red-500">
          ✗ The seed from {admin.seedSource ? SOURCE_LABELS[admin.seedSource] : 'storage'} does not match the
          commitment for round {round}. Load the file saved when this round was started.
        </p>
      )}
      {admin.seedNotice && <p className="text-sm text-left text-amber-500">⚠️ {admin.seedNotice}</p>}
      {admin.seedInputError && <p className="text-sm text-left text-red-500">{admin.seedInputError}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Upload seed file">
          <input
            type="file"
            accept="application/json,.json"
            className="block w-full text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void admin.loadSeedFile(file)
              e.target.value = ''
            }}
          />
        </Field>
        <form
          className="space-y-1"
          onSubmit={(e) => {
            e.preventDefault()
            admin.pasteSeed(pasted)
          }}
        >
          <Field label="…or paste the seed (0x + 64 hex)">
            <div className="flex gap-2">
              <input className={inputClass(darkMode)} value={pasted} onChange={(e) => setPasted(e.target.value)} placeholder="0x…" />
              <button type="submit" className="btn-outline px-3 py-2 text-sm">
                Use
              </button>
            </div>
          </Field>
        </form>
      </div>

      <button
        className={`btn-secondary text-lg py-3 w-full ${admin.seedStatus !== 'match' ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => void admin.endMinting()}
        disabled={busy || admin.seedStatus !== 'match'}
      >
        Reveal Seed &amp; Start Play
      </button>
    </Section>
  )
}

function MintConfigForm({
  darkMode,
  initial,
  onSubmit,
  busy,
}: {
  darkMode: boolean
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
      className="space-y-3"
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="Price (ETH)">
          <input className={inputClass(darkMode)} value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" />
        </Field>
        <Field label="Max per wallet (0 = ∞)">
          <input className={inputClass(darkMode)} value={maxPerWallet} onChange={(e) => setMaxPerWallet(e.target.value)} inputMode="numeric" />
        </Field>
        <Field label="Max per round (0 = ∞)">
          <input className={inputClass(darkMode)} value={maxPerRound} onChange={(e) => setMaxPerRound(e.target.value)} inputMode="numeric" />
        </Field>
      </div>
      {error && <p className="text-sm text-red-500 text-left">{error}</p>}
      <button type="submit" className="btn-outline py-2 w-full" disabled={busy}>
        Save Mint Config
      </button>
    </form>
  )
}

function FuseConfigForm({
  darkMode,
  initial,
  onSubmit,
  busy,
}: {
  darkMode: boolean
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
  const fields: { key: keyof typeof values; label: string }[] = [
    { key: 'initial', label: 'Initial fuse (s)' },
    { key: 'decreaseEvery', label: 'Shorten every N passes (0 = never)' },
    { key: 'decreaseBy', label: 'Shorten by (s)' },
    { key: 'minimum', label: 'Minimum fuse (s)' },
  ]

  return (
    <form
      className="space-y-3"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {fields.map(({ key, label }) => (
          <Field key={key} label={label}>
            <input
              className={inputClass(darkMode)}
              value={values[key]}
              inputMode="numeric"
              onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
            />
          </Field>
        ))}
      </div>
      <button type="submit" className="btn-outline py-2 w-full" disabled={busy}>
        Save Fuse Config
      </button>
    </form>
  )
}

function PayeesForm({
  darkMode,
  initial,
  onSubmit,
  busy,
}: {
  darkMode: boolean
  initial: PayeesInput | undefined
  onSubmit: (input: PayeesInput) => void
  busy: boolean
}) {
  const [values, setValues] = useState<PayeesInput>(
    initial ?? { project: '', team1: '', team2: '', charity: '' },
  )
  const fields: { key: keyof PayeesInput; label: string }[] = [
    { key: 'project', label: 'Project (10%)' },
    { key: 'team1', label: 'Team wallet 1 (15%)' },
    { key: 'team2', label: 'Team wallet 2 (15%)' },
    { key: 'charity', label: 'Charity (20%)' },
  ]

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(values)
      }}
    >
      {fields.map(({ key, label }) => (
        <Field key={key} label={label}>
          <input
            className={`${inputClass(darkMode)} font-mono`}
            value={values[key]}
            onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
            placeholder="0x…"
          />
        </Field>
      ))}
      <button type="submit" className="btn-outline py-2 w-full" disabled={busy}>
        Save Payees
      </button>
    </form>
  )
}

/** Owner-only controls. Rendered once per page; both layouts share the same `admin` object. */
export default function AdminControls({ darkMode, admin, info, busy }: AdminControlsProps) {
  const [showSettings, setShowSettings] = useState(false)
  if (!admin.isOwner || !info) return null

  const state = info.state
  const canStart = state === GameState.Queued || state === GameState.Ended
  const canPause = state === GameState.Minting || state === GameState.Playing || state === GameState.FinalRound
  const canCancel = !canStart
  const { mint, fuse, payees } = admin.currentConfig

  const cancel = () => {
    const ok = window.confirm(
      `Cancel round ${admin.round}? There will be no winner and its pot rolls over into the next round.`,
    )
    if (ok) void admin.cancelRound()
  }

  return (
    <div className={`w-full max-w-4xl mx-auto ${darkMode ? 'card-dark' : 'card'} p-6 sm:p-8 mb-8 animate-fade-in-up space-y-6`}>
      <div className="text-center">
        <h2 className="text-4xl font-bold gradient-text mb-2">🎮 Admin Controls</h2>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Round {info.round.toString()} · <span className="font-semibold text-amber-500">{gameStateLabel(state)}</span>
        </p>
      </div>

      {canStart && <StartRoundPanel darkMode={darkMode} admin={admin} busy={busy} />}
      {state === GameState.Minting && <EndMintingPanel darkMode={darkMode} admin={admin} busy={busy} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {canPause && (
          <button className="btn-outline text-lg py-3" onClick={() => void admin.pauseGame()} disabled={busy}>
            ⏸️ Pause
          </button>
        )}
        {state === GameState.Paused && (
          <button className="btn-primary text-lg py-3" onClick={() => void admin.resumeGame()} disabled={busy}>
            ▶️ Resume
          </button>
        )}
        {canCancel && (
          <button className="btn-outline text-lg py-3 text-red-500" onClick={cancel} disabled={busy}>
            🛑 Cancel Round
          </button>
        )}
      </div>

      <div>
        <button className="btn-outline w-full py-2" onClick={() => setShowSettings(!showSettings)}>
          {showSettings ? 'Hide Settings' : '⚙️ Settings'}
        </button>
        {showSettings && (
          <div className="mt-4 space-y-4">
            <Section darkMode={darkMode} title="Mint">
              {canStart ? (
                <MintConfigForm
                  key={mint ? `${mint.price}-${mint.maxPerWallet}-${mint.maxPerRound}` : 'loading'}
                  darkMode={darkMode}
                  initial={mint}
                  onSubmit={(input) => void admin.setMintConfig(input)}
                  busy={busy}
                />
              ) : (
                <p className="text-sm text-left">The mint config can be changed while the game is Queued or Ended.</p>
              )}
            </Section>
            <Section darkMode={darkMode} title="Fuse">
              {canStart || state === GameState.Minting ? (
                <FuseConfigForm
                  key={fuse ? `${fuse.initial}-${fuse.decreaseEvery}-${fuse.decreaseBy}-${fuse.minimum}` : 'loading'}
                  darkMode={darkMode}
                  initial={fuse}
                  onSubmit={(input) => void admin.setFuseConfig(input)}
                  busy={busy}
                />
              ) : (
                <p className="text-sm text-left">The fuse can be changed before play starts.</p>
              )}
            </Section>
            <Section darkMode={darkMode} title="Payees">
              <PayeesForm
                key={payees ? Object.values(payees).join('-') : 'loading'}
                darkMode={darkMode}
                initial={payees}
                onSubmit={(input) => void admin.setPayees(input)}
                busy={busy}
              />
            </Section>
          </div>
        )}
      </div>
    </div>
  )
}
