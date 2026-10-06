import React, { memo, useState } from 'react'
import Image from 'next/image'
import Modal from 'react-modal'
import { Skeleton } from './ui'
import type { HandImage as HandImageData } from '../hooks/useHandImages'

if (typeof document !== 'undefined' && document.getElementById('__next')) {
  Modal.setAppElement('#__next')
}

interface HandImageProps {
  tokenId: number
  image: HandImageData | undefined
  isPotato?: boolean
  className?: string
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

/**
 * One hand's pixel art as a square, with a click-to-enlarge sheet.
 * The caller provides the muted tile background and the "#id" caption.
 */
function HandImage({ tokenId, image, isPotato = false, className = '' }: HandImageProps) {
  const [isModalOpen, setModalOpen] = useState(false)

  if (!image || image.isLoading) {
    return <Skeleton className={`w-full aspect-square rounded-xl ${className}`} />
  }

  if (image.isError || !image.src) {
    return (
      <div
        className={`flex w-full aspect-square items-center justify-center rounded-xl px-1 text-center text-[12px] leading-4 text-fg-tertiary ${className}`}
      >
        No image
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        aria-label={`View hand #${tokenId}`}
        className={`relative block w-full aspect-square overflow-hidden rounded-xl transition-opacity duration-200 ease-apple hover:opacity-90 ${className}`}
      >
        <Image
          src={image.src}
          fill
          unoptimized
          alt={`Hand #${tokenId}`}
          className="object-contain pixelated"
          loading={isPotato ? 'eager' : 'lazy'}
        />
      </button>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setModalOpen(false)}
        contentLabel={`Hand #${tokenId}`}
        className="fixed inset-x-4 top-1/2 mx-auto w-auto max-w-md -translate-y-1/2 outline-none"
        overlayClassName="fixed inset-0 z-50 bg-black/60 animate-fade-in"
      >
        <div className="rounded-3xl border border-line bg-elevated p-4 shadow-lg animate-fade-up">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[15px] font-semibold tnum">Hand #{tokenId}</span>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              aria-label="Close"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-fg-secondary transition-colors duration-200 ease-apple hover:bg-surface-muted hover:text-fg"
            >
              <CloseIcon />
            </button>
          </div>
          <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-surface-muted">
            <Image src={image.src} alt={`Hand #${tokenId}`} fill unoptimized className="object-contain pixelated" />
          </div>
        </div>
      </Modal>
    </>
  )
}

export default memo(HandImage)
