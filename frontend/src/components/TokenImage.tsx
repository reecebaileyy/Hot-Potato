'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Modal from 'react-modal'
import { BsXCircle } from 'react-icons/bs'

Modal.setAppElement('#__next')

interface TokenImageProps {
  tokenId: number;
  imageString: string;
  potatoTokenId?: number;
  isLoading?: boolean;
  isError?: boolean;
  onTokenExploded?: (tokenId: number) => void;
  className?: string;
  size?: number;
}

const OptimizedImage: React.FC<React.ComponentProps<typeof Image>> = (props) => (
  <Image {...props} unoptimized={true} />
)

const TokenImage: React.FC<TokenImageProps> = ({
  tokenId,
  imageString,
  potatoTokenId = 0,
  isLoading = false,
  isError = false,
  size = 500,
}) => {
  const [isModalOpen, setModalOpen] = useState(false)

  const openModal = () => setModalOpen(true)
  const closeModal = () => setModalOpen(false)

  // --- Render ---
  if (isLoading) return <div>Loading...</div>

  if (isError)
    return (
      <div>
        Error loading image.
      </div>
    )

  return (
    <div
      className={`relative ${
        tokenId === potatoTokenId ? 'animate-pulse' : ''
      } flex flex-col`}
      key={tokenId}
    >
      <OptimizedImage
        src={`data:image/svg+xml,${encodeURIComponent(String(imageString))}`}
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
              String(imageString)
            )}`}
            alt={`Token ${tokenId} Image`}
            width={800}
            height={800}
          />
        </div>
      </Modal>

      <span>Token ID: {tokenId}</span>
    </div>
  )
}

export default TokenImage