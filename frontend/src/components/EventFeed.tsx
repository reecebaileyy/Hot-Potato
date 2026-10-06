import React, { useEffect, useRef } from 'react'
import type { FeedItem } from '../hooks/useGameEvents'

interface EventFeedProps {
  darkMode: boolean
  feed: FeedItem[]
}

/** Horizontal ticker of the latest contract events. */
export default function EventFeed({ darkMode, feed }: EventFeedProps) {
  const endOfFeed = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endOfFeed.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
  }, [feed])

  if (feed.length === 0) return null

  return (
    <div className={`hide-scrollbar w-full md:w-2/3 lg:w-1/2 mx-auto mb-6 ${darkMode ? 'bg-black' : 'bg-white'} shadow rounded-md overflow-x-auto`}>
      <div className="scrollable-div whitespace-nowrap h-full flex items-center space-x-6 px-4 py-2 overflow-auto">
        {feed.map((item) => (
          <div key={item.id} className={darkMode ? 'text-white' : 'text-black'}>
            {item.text}
          </div>
        ))}
        <div ref={endOfFeed} />
      </div>
    </div>
  )
}
