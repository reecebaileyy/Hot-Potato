'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Modal from 'react-modal'
import { BsXCircle } from 'react-icons/bs'

Modal.setAppElement('#__next')

interface TokenImageProps {
  tokenId: number
  imageString: string
  isLoading: boolean
  isError: boolean
  potatoTokenId?: number
  onTokenExploded?: (tokenId: number) => void
  delay?: number
  className?: string
  size?: number
  onRefresh?: () => void
}

const OptimizedImage: React.FC<React.ComponentProps<typeof Image>> = (props) => (
  <Image {...props} unoptimized={true} alt={props.alt || 'Token Image'} />
)

const TokenImage: React.FC<TokenImageProps> = ({
  tokenId,
  imageString,
  isLoading,
  isError,
  potatoTokenId,
  onTokenExploded,
  delay,
  size = 500,
  onRefresh,
}) => {
  const [isModalOpen, setModalOpen] = useState(false)

  const openModal = () => setModalOpen(true)
  const closeModal = () => setModalOpen(false)

  // --- Render ---
  if (isLoading) {
    return (
      <div className="animate-pulse bg-gray-300 h-32 w-32 rounded-lg flex items-center justify-center">
        <span className="text-sm">Loading...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-32 w-32 border rounded-lg">
        <span className="text-xs text-red-500 mb-2">Error</span>
        <button
          className="px-2 py-1 bg-red-500 text-white rounded text-xs"
          onClick={onRefresh}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div
      className={`relative ${
        tokenId === potatoTokenId ? 'animate-pulse' : ''
      } flex flex-col`}
      key={tokenId}
    >
      <OptimizedImage
        src={`data:image/svg+xml,${encodeURIComponent(imageString)}`}
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
            src={`data:image/svg+xml,${encodeURIComponent(imageString)}`}
            alt={`Token ${tokenId} Image`}
            width={800}
            height={800}
          />
        </div>
      </Modal>

      <span className="text-xs text-center mt-1">#{tokenId}</span>
    </div>
  )
}

export default TokenImage
