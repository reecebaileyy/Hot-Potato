'use client'

import React, { useEffect, useState } from 'react'
import { useReadContract, useWatchContractEvent } from 'wagmi'
import Image from 'next/image'
import Modal from 'react-modal'
import { BsXCircle } from 'react-icons/bs'

Modal.setAppElement('#__next')

interface TokenImageProps {
  tokenId: number;
  ABI: any;
  potatoTokenId?: number;
  shouldRefresh?: boolean;
  onTokenExploded?: (tokenId: number) => void;
  delay?: number;
  className?: string;
}


const CONTRACT_ADDRESS = '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07' as const

const OptimizedImage: React.FC<React.ComponentProps<typeof Image>> = (props) => (
  <Image {...props} unoptimized={true} />
)

const TokenImage: React.FC<TokenImageProps> = ({
  tokenId,
  ABI,
  shouldRefresh,
  size = 500,
  onTokenExploded,
  delay,
}) => {
  const [isModalOpen, setModalOpen] = useState(false)

  const openModal = () => setModalOpen(true)
  const closeModal = () => setModalOpen(false)

  // --- Reads ---
  const {
    data: getImageString,
    isLoading,
    isError,
    refetch: refetchImageString,
  } = useReadContract({
    abi: ABI,
    address: CONTRACT_ADDRESS,
    functionName: 'getImageString',
    args: [tokenId],
  })

  const { refetch: refetchGetActiveTokens } = useReadContract({
    abi: ABI,
    address: CONTRACT_ADDRESS,
    functionName: 'getActiveTokens',
  })

  const { data: potatoTokenId, refetch: refetchPotatoTokenId } = useReadContract(
    {
      abi: ABI,
      address: CONTRACT_ADDRESS,
      functionName: 'potatoTokenId',
    }
  )

  const _potatoTokenId = Number(potatoTokenId)

  // --- Events ---
  useWatchContractEvent({
    abi: ABI,
    address: CONTRACT_ADDRESS,
    eventName: 'PotatoExploded',
    onLogs: async (logs) => {
      try {
        const tokenId_ = logs[0]?.args?.tokenId?.toString()
        if (tokenId_ && tokenId_ === tokenId.toString()) {
          onTokenExploded(tokenId)
          await refetchGetActiveTokens?.()
          await refetchPotatoTokenId?.()
        }
      } catch (err) {
        console.error('Error on PotatoExploded', err)
      }
    },
  })

  useWatchContractEvent({
    abi: ABI,
    address: CONTRACT_ADDRESS,
    eventName: 'PotatoPassed',
    onLogs: async (logs) => {
      const from = logs[0]?.args?.tokenIdFrom
      const to = logs[0]?.args?.tokenIdTo
      if (typeof from === 'bigint' && typeof to === 'bigint') {
        await refetchImageString?.()
      }
    },
  })

  useWatchContractEvent({
    abi: ABI,
    address: CONTRACT_ADDRESS,
    eventName: 'PotatoMinted',
    onLogs: async () => {
      await refetchImageString?.({ args: [tokenId] })
      await refetchGetActiveTokens?.()
      await refetchPotatoTokenId?.()
    },
  })

  useWatchContractEvent({
    abi: ABI,
    address: CONTRACT_ADDRESS,
    eventName: 'NewRound',
    onLogs: async () => {
      await refetchGetActiveTokens?.()
      await refetchPotatoTokenId?.()
      await refetchImageString?.({ args: [tokenId] })
    },
  })

  // --- Effects ---
  useEffect(() => {
    const timer = setTimeout(() => {
      refetchPotatoTokenId?.()
      refetchGetActiveTokens?.()
      refetchImageString?.({ args: [tokenId] })
    }, delay)

    return () => clearTimeout(timer)
  }, [tokenId, shouldRefresh, delay])

  // --- Render ---
  if (isLoading) return <div>Loading...</div>

  if (isError)
    return (
      <div>
        Error loading image.{' '}
        <button
          className="p-2 bg-black text-white rounded-lg"
          onClick={() => refetchImageString?.({ args: [tokenId] })}
        >
          Try Refreshing
        </button>
      </div>
    )

  return (
    <div
      className={`relative ${
        tokenId === _potatoTokenId ? 'animate-pulse' : ''
      } flex flex-col`}
      key={tokenId}
    >
      <OptimizedImage
        src={`data:image/svg+xml,${encodeURIComponent(String(getImageString))}`}
        width={size}
        height={size}
        alt={`Token ${tokenId} Image`}
        className="cursor-pointer"
        onClick={openModal}
      />

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel={`Token ${tokenId} Image`}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 flex items-center justify-center bg-transparent"
      >
        <div className="relative flex items-center justify-center">
          <button
            onClick={closeModal}
            className="absolute top-0 right-0 text-3xl mt-2 mr-2"
          >
            <BsXCircle />
          </button>
          <OptimizedImage
            src={`data:image/svg+xml,${encodeURIComponent(
              String(getImageString)
            )}`}
            alt={`Token ${tokenId} Image`}
            width={800}
            height={800}
          />
        </div>
      </Modal>

      <span>Token ID: {tokenId}</span>

      {isError && (
        <button onClick={() => refetchImageString?.({ args: [tokenId] })}>
          Refresh Image
        </button>
      )}
    </div>
  )
}

export default TokenImage
