import React, { useEffect, useRef, useState } from 'react'
import { Card } from './ui'
import type { FeedItem } from '../hooks/useGameEvents'

interface EventFeedProps {
  feed: FeedItem[]
}

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })

/** Latest contract events as a divided list: time seen, dot, text. Newest at the bottom. */
export default function EventFeed({ feed }: EventFeedProps) {
  const list = useRef<HTMLDivElement | null>(null)
  // Arrival time of each item, recorded after commit (events carry no timestamp of their own).
  const [seenAt, setSeenAt] = useState<Record<string, number>>({})

  useEffect(() => {
    const id = setTimeout(() => {
      const now = Date.now()
      setSeenAt((prev) => {
        const next: Record<string, number> = {}
        let changed = false
        for (const item of feed) {
          if (item.id in prev) next[item.id] = prev[item.id]
          else {
            next[item.id] = now
            changed = true
          }
        }
        return changed || Object.keys(prev).length !== feed.length ? next : prev
      })
      list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' })
    }, 0)
    return () => clearTimeout(id)
  }, [feed])

  return (
    <Card variant="plain" className="overflow-hidden">
      <div className="flex items-baseline justify-between gap-4 px-5 pb-3 pt-5 sm:px-6 sm:pt-6">
        <h3 className="text-[17px] leading-6 font-semibold">Activity</h3>
        <span className="text-[13px] leading-5 text-fg-secondary tnum">
          {feed.length} event{feed.length === 1 ? '' : 's'}
        </span>
      </div>

      {feed.length === 0 ? (
        <p className="px-5 pb-6 text-[15px] leading-6 text-fg-secondary sm:px-6">
          Nothing yet. Mints, passes and explosions show up here as they happen on chain.
        </p>
      ) : (
        <div ref={list} className="max-h-72 overflow-y-auto">
          <ul aria-live="polite">
            {feed.map((item) => {
              const at = seenAt[item.id]
              return (
                <li key={item.id} className="flex items-start gap-3 border-t border-line px-5 py-3 text-[15px] leading-6 sm:px-6">
                  <span className="w-16 shrink-0 whitespace-nowrap text-[13px] leading-6 text-fg-tertiary tnum">
                    {at ? timeFormat.format(at) : ''}
                  </span>
                  <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span className="min-w-0 flex-1 break-words">{item.text}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </Card>
  )
}
