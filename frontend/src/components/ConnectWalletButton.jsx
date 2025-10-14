// components/ConnectWalletButton.jsx
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useAccount } from 'wagmi'

export default function ConnectWalletButton() {
  const { ready, authenticated, login, logout } = usePrivy()
  const { wallets } = useWallets()
  const { address } = useAccount()

  if (!ready) {
    return (
      <button className="px-4 py-2 bg-gray-500 rounded text-white" disabled>
        Loading...
      </button>
    )
  }

  if (!authenticated) {
    return (
      <button
        onClick={login}
        className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold"
      >
        Connect Wallet
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-300 truncate max-w-[150px]">
        {address
          ? `${address.slice(0, 6)}...${address.slice(-4)}`
          : wallets[0]?.address?.slice(0, 6) + '...'}
      </span>
      <button
        onClick={logout}
        className="px-4 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm"
      >
        Disconnect
      </button>
    </div>
  )
}
