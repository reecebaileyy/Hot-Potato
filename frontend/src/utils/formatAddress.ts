/**
 * Format a wallet address to show only first 5 and last 3 characters
 * Example: 0x41b1e204e9c15fF5894bd47C6Dc3a7Fa98C775C7 -> 0x41b...5C7
 */
export function formatAddress(address: string | undefined | null): string {
  if (!address) return ''
  if (address.length < 10) return address
  return `${address.slice(0, 5)}...${address.slice(-3)}`
}

