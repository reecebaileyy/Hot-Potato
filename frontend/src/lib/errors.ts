import {
  BaseError,
  ContractFunctionRevertedError,
  InsufficientFundsError,
  UserRejectedRequestError,
} from 'viem'
import { formatEth, gameStateLabel } from './game'

export interface FriendlyError {
  emoji: string
  title: string
  message: string
  suggestion?: string
}

type RevertArgs = readonly unknown[] | undefined

const asBigInt = (value: unknown): bigint | undefined =>
  typeof value === 'bigint' ? value : undefined

/** Human copy for the Game contract's custom errors (also used for client-side pre-checks). */
export function contractErrorCopy(name: string, args?: RevertArgs): FriendlyError | null {
  const arg = (i: number) => args?.[i]
  switch (name) {
    case 'WrongState':
      return {
        emoji: '🎮',
        title: 'Not Right Now',
        message: `The game is ${gameStateLabel(Number(arg(0)))}, so this action isn't available.`,
        suggestion: 'Wait for the game to move to the right phase and try again.',
      }
    case 'ZeroQuantity':
      return { emoji: '✋', title: 'Pick an Amount', message: 'Mint at least one hand.' }
    case 'WrongPayment':
      return {
        emoji: '💰',
        title: 'Wrong Payment',
        message: `This mint costs ${formatEth(asBigInt(arg(0)), 6)} ETH but ${formatEth(asBigInt(arg(1)), 6)} ETH was sent.`,
        suggestion: 'The price may have changed. Refresh and try again.',
      }
    case 'WalletMintLimit':
      return {
        emoji: '🖐️',
        title: 'Wallet Limit Reached',
        message: `Each wallet can mint at most ${String(arg(0))} hands per round.`,
      }
    case 'RoundMintLimit':
      return {
        emoji: '🧺',
        title: 'Round Is Full',
        message: `This round is capped at ${String(arg(0))} hands.`,
      }
    case 'NotEnoughPlayers':
      return {
        emoji: '👥',
        title: 'Not Enough Players',
        message: 'At least two different wallets must hold hands before play can start.',
      }
    case 'NotPotatoHolder':
      return {
        emoji: '🥔',
        title: "You Don't Have the Potato",
        message: 'Only the wallet holding the potato can pass it.',
      }
    case 'TargetNotActive':
      return {
        emoji: '💤',
        title: 'Hand Not in Play',
        message: `Hand #${String(arg(0))} is not active in this round.`,
        suggestion: 'Pick a hand from the active grid.',
      }
    case 'CannotPassToSelf':
      return {
        emoji: '🔁',
        title: "That's Your Own Hand",
        message: 'Pass the potato to a hand owned by someone else.',
      }
    case 'FuseStillBurning':
      return {
        emoji: '🧨',
        title: 'Fuse Still Burning',
        message: `The potato can't be detonated yet (${String(arg(0))}s left).`,
      }
    case 'HandsLockedDuringPlay':
      return {
        emoji: '🔒',
        title: 'Hands Are Locked',
        message: "Hands can't be transferred while a round is in play.",
      }
    case 'NothingToWithdraw':
      return { emoji: '🫙', title: 'Nothing to Claim', message: 'You have no rewards waiting.' }
    case 'WithdrawFailed':
      return {
        emoji: '⚠️',
        title: 'Withdraw Failed',
        message: 'Your wallet could not receive the ETH.',
        suggestion: 'Contract wallets must be able to accept plain ETH transfers.',
      }
    case 'SeedMismatch':
      return {
        emoji: '🔑',
        title: 'Seed Does Not Match',
        message: "This seed doesn't match the commitment stored on chain for the round.",
        suggestion: 'Load the seed file saved when this round was started.',
      }
    case 'SeedAlreadyRevealed':
      return { emoji: '🔑', title: 'Seed Already Revealed', message: 'This round has already started.' }
    case 'InvalidCommitment':
      return { emoji: '🔑', title: 'Invalid Commitment', message: 'The seed commitment cannot be zero.' }
    case 'InvalidFuseConfig':
      return {
        emoji: '🧨',
        title: 'Invalid Fuse Config',
        message: 'The minimum must be above zero and no larger than the initial fuse.',
      }
    case 'ZeroAddress':
      return { emoji: '📭', title: 'Missing Address', message: 'Every payee needs a non-zero address.' }
    case 'OwnableUnauthorizedAccount':
      return { emoji: '🚫', title: 'Owner Only', message: 'Only the game owner can do that.' }
    case 'NonexistentToken':
    case 'OwnerQueryForNonexistentToken':
      return { emoji: '🔍', title: 'No Such Hand', message: "That token doesn't exist." }
    default:
      return null
  }
}

/** Fallback for errors that don't carry a decoded contract revert. */
function describeMessage(text: string): FriendlyError {
  const lower = text.toLowerCase()
  if (lower.includes('user rejected') || lower.includes('user denied')) {
    return {
      emoji: '✋',
      title: 'Transaction Cancelled',
      message: 'You cancelled the transaction.',
      suggestion: "No worries! Try again when you're ready.",
    }
  }
  if (lower.includes('insufficient funds')) {
    return {
      emoji: '💰',
      title: 'Insufficient Funds',
      message: "You don't have enough ETH for this transaction and its gas.",
      suggestion: 'Add ETH on Robinhood Chain and try again.',
    }
  }
  if (lower.includes('chain') && (lower.includes('mismatch') || lower.includes('switch'))) {
    return {
      emoji: '🔀',
      title: 'Wrong Network',
      message: 'Your wallet is connected to a different network.',
      suggestion: 'Switch your wallet to the network shown in the app and try again.',
    }
  }
  if (lower.includes('network') || lower.includes('fetch') || lower.includes('timeout')) {
    return {
      emoji: '🌐',
      title: 'Network Issue',
      message: 'Unable to reach the blockchain.',
      suggestion: 'Check your connection and try again.',
    }
  }
  return {
    emoji: '❌',
    title: 'Something Went Wrong',
    message: text.length > 200 ? `${text.slice(0, 200)}…` : text || 'An unexpected error occurred.',
  }
}

/** Turns anything thrown by wagmi/viem (or our own checks) into copy for the UI. */
export function describeError(error: unknown): FriendlyError {
  if (error instanceof BaseError) {
    if (error.walk((e) => e instanceof UserRejectedRequestError)) {
      return describeMessage('user rejected')
    }
    if (error.walk((e) => e instanceof InsufficientFundsError)) {
      return describeMessage('insufficient funds')
    }
    const revert = error.walk((e) => e instanceof ContractFunctionRevertedError)
    if (revert instanceof ContractFunctionRevertedError) {
      const name = revert.data?.errorName ?? revert.reason
      const described = name ? contractErrorCopy(name, revert.data?.args) : null
      if (described) return described
      if (revert.reason) {
        return { emoji: '⚠️', title: 'Transaction Rejected', message: revert.reason }
      }
    }
    return describeMessage(error.shortMessage || error.message)
  }
  if (error instanceof Error) return describeMessage(error.message)
  return describeMessage(String(error))
}
