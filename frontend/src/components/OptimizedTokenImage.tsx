'use client'

import React, { useState, useMemo, memo } from 'react'
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

// Memoize the SVG data URI generation
const useSvgDataUri = (imageString: string) => {
  return useMemo(() => {
    if (!imageString) return ''
    return `data:image/svg+xml,${encodeURIComponent(imageString)}`
  }, [imageString])
}

const TokenImage: React.FC<TokenImageProps> = memo(({
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
  
  // Memoize SVG data URI to avoid recalculating on every render
  const svgDataUri = useSvgDataUri(imageString)
  
  // Memoize modal handlers
  const openModal = useMemo(() => () => setModalOpen(true), [])
  const closeModal = useMemo(() => () => setModalOpen(false), [])
  
  // Memoize isPotato check
  const isPotato = useMemo(() => tokenId === potatoTokenId, [tokenId, potatoTokenId])

  // --- Render ---
  if (isLoading) {
    return (
      <div className="animate-pulse bg-gray-300 w-full aspect-square rounded-lg flex items-center justify-center">
        <span className="text-sm">Loading...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center w-full aspect-square border rounded-lg">
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
      className={`relative w-full ${
        isPotato ? 'animate-pulse' : ''
      } flex flex-col`}
      key={tokenId}
    >
      <div className="relative w-full aspect-square">
        <OptimizedImage
          src={svgDataUri}
          fill
          alt={`Token ${tokenId} Image`}
          className="cursor-pointer object-contain rounded-lg"
          onClick={openModal}
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 12vw"
          priority={isPotato} // Prioritize loading the potato token
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel={`Token ${tokenId} Image`}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 sm:w-3/4 md:w-2/3 lg:w-1/2 max-w-2xl aspect-square flex items-center justify-center bg-transparent z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-75 z-50"
      >
        <div className="relative flex items-center justify-center w-full h-full">
          <button
            onClick={closeModal}
            className="absolute -top-8 sm:-top-10 right-0 text-white text-3xl sm:text-4xl hover:text-red-500 transition-colors z-10"
          >
            <BsXCircle />
          </button>
          <div className="relative w-full h-full">
            <OptimizedImage
              src={svgDataUri}
              alt={`Token ${tokenId} Image`}
              fill
              className="object-contain"
            />
          </div>
        </div>
      </Modal>

      <span className="text-xs sm:text-sm text-center mt-2 font-semibold">#{tokenId}</span>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  // Only re-render if these specific props change
  return (
    prevProps.tokenId === nextProps.tokenId &&
    prevProps.imageString === nextProps.imageString &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.isError === nextProps.isError &&
    prevProps.potatoTokenId === nextProps.potatoTokenId
  )
})

TokenImage.displayName = 'TokenImage'

export default TokenImage
