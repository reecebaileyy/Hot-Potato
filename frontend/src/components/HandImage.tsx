import React, { memo, useState } from 'react'
import Image from 'next/image'
import Modal from 'react-modal'
import { BsXCircle } from 'react-icons/bs'
import type { HandImage as HandImageData } from '../hooks/useHandImages'

if (typeof document !== 'undefined' && document.getElementById('__next')) {
  Modal.setAppElement('#__next')
}

interface HandImageProps {
  tokenId: number
  image: HandImageData | undefined
  isPotato?: boolean
}

/** One hand's art with a click-to-enlarge modal. */
function HandImage({ tokenId, image, isPotato = false }: HandImageProps) {
  const [isModalOpen, setModalOpen] = useState(false)

  if (!image || image.isLoading) {
    return (
      <div className="animate-pulse bg-gray-300 w-full aspect-square rounded-lg flex items-center justify-center">
        <span className="text-sm">Loading...</span>
      </div>
    )
  }

  if (image.isError || !image.src) {
    return (
      <div className="flex flex-col items-center justify-center w-full aspect-square border rounded-lg">
        <span className="text-xs text-red-500">Image unavailable</span>
        <span className="text-xs mt-2 font-semibold">#{tokenId}</span>
      </div>
    )
  }

  return (
    <div className={`relative w-full flex flex-col ${isPotato ? 'animate-pulse' : ''}`}>
      <div className="relative w-full aspect-square">
        <Image
          src={image.src}
          fill
          unoptimized
          alt={`Hand #${tokenId}`}
          className="cursor-pointer object-contain rounded-lg"
          onClick={() => setModalOpen(true)}
          loading={isPotato ? 'eager' : 'lazy'}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setModalOpen(false)}
        contentLabel={`Hand #${tokenId}`}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 sm:w-3/4 md:w-2/3 lg:w-1/2 max-w-2xl aspect-square flex items-center justify-center bg-transparent z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-75 z-50"
      >
        <div className="relative flex items-center justify-center w-full h-full">
          <button
            onClick={() => setModalOpen(false)}
            aria-label="Close"
            className="absolute -top-8 sm:-top-10 right-0 text-white text-3xl sm:text-4xl hover:text-red-500 transition-colors z-10"
          >
            <BsXCircle />
          </button>
          <div className="relative w-full h-full">
            <Image src={image.src} alt={`Hand #${tokenId}`} fill unoptimized className="object-contain" />
          </div>
        </div>
      </Modal>

      <span className="text-xs sm:text-sm text-center mt-2 font-semibold">#{tokenId}</span>
    </div>
  )
}

export default memo(HandImage)
