import React from 'react'
import { explorerAddressUrl } from '../../config/chain'
import { formatAddress } from '../../utils/formatAddress'

interface AddressLinkProps {
  address: string
  /** Show `0x41b...5C7` instead of the full address. */
  short?: boolean
  className?: string
}

/** An address as a block-explorer link (plain text on chains without an explorer). */
export default function AddressLink({ address, short = false, className = '' }: AddressLinkProps) {
  const href = explorerAddressUrl(address)
  const label = short ? formatAddress(address) : address
  const classes = `font-mono text-[13px] tracking-tight ${className}`
  if (!href) {
    return (
      <span title={address} className={classes}>
        {label}
      </span>
    )
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={address}
      className={`${classes} underline-offset-2 transition-colors duration-200 ease-apple hover:text-accent hover:underline`}
    >
      {label}
    </a>
  )
}
