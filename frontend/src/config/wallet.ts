/**
 * Privy (email / social login + embedded wallets) is optional. Without NEXT_PUBLIC_PRIVY_APP_ID
 * the app falls back to plain wagmi with injected wallets (MetaMask, Rabby, ...), which is what
 * local development against a hardhat node uses.
 */
export const privyAppId: string | undefined = process.env.NEXT_PUBLIC_PRIVY_APP_ID || undefined

export const hasPrivy: boolean = !!privyAppId
