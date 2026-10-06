import { useCallback, useEffect, useRef, useState } from 'react'
import { useConfig } from 'wagmi'
import { getConnection, switchChain, waitForTransactionReceipt } from 'wagmi/actions'
import type { Address, Hash, TransactionReceipt } from 'viem'
import { chain } from '../config/chain'
import { describeError, type FriendlyError } from '../lib/errors'

export type TxState =
  | { status: 'idle' }
  | { status: 'pending'; label: string }
  | { status: 'confirming'; label: string; hash: Hash }
  | { status: 'success'; label: string; hash: Hash }
  | { status: 'error'; label: string; error: FriendlyError }

const NOT_CONNECTED: FriendlyError = {
  emoji: '👛',
  title: 'Wallet Not Connected',
  message: 'Connect your wallet to continue.',
}

/**
 * Runs one transaction at a time and tracks it for the notification toasts:
 * switch to the app's chain if needed, send (callers simulate first so reverts decode
 * into the contract's custom errors), wait for the receipt, then call `onConfirmed`.
 */
export function useTransaction(onConfirmed?: () => void) {
  const config = useConfig()
  const [tx, setTx] = useState<TxState>({ status: 'idle' })
  const onConfirmedRef = useRef(onConfirmed)

  useEffect(() => {
    onConfirmedRef.current = onConfirmed
  }, [onConfirmed])

  const run = useCallback(
    async (
      label: string,
      send: (account: Address) => Promise<Hash>,
    ): Promise<TransactionReceipt | undefined> => {
      const connection = getConnection(config)
      if (!connection.address) {
        setTx({ status: 'error', label, error: NOT_CONNECTED })
        return undefined
      }
      setTx({ status: 'pending', label })
      try {
        if (connection.chainId !== chain.id) await switchChain(config, { chainId: chain.id })
        const hash = await send(connection.address)
        setTx({ status: 'confirming', label, hash })
        const receipt = await waitForTransactionReceipt(config, { hash, chainId: chain.id })
        if (receipt.status !== 'success') throw new Error('The transaction reverted on chain.')
        setTx({ status: 'success', label, hash })
        onConfirmedRef.current?.()
        return receipt
      } catch (error) {
        console.error(`${label} failed`, error)
        setTx({ status: 'error', label, error: describeError(error) })
        return undefined
      }
    },
    [config],
  )

  /** Shows an error without sending anything (failed client-side checks). */
  const fail = useCallback((label: string, error: FriendlyError) => {
    setTx({ status: 'error', label, error })
  }, [])

  const reset = useCallback(() => setTx({ status: 'idle' }), [])

  const busy = tx.status === 'pending' || tx.status === 'confirming'
  return { tx, busy, run, fail, reset }
}

export type TransactionRunner = ReturnType<typeof useTransaction>
