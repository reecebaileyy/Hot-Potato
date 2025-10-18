import React, { useRef, useEffect } from 'react'

interface EventFeedProps {
  darkMode: boolean
  events: string[]
}

export default function EventFeed({ darkMode, events }: EventFeedProps) {
  const endOfDiv = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (endOfDiv.current) {
      endOfDiv.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
    }
  }, [events])

  return (
    <div className={`hide-scrollbar w-full col-start-1 col-end-9 md:w-2/3 lg:w-1/2 ${darkMode ? 'bg-black' : 'bg-white'} shadow rounded-md overflow-x-auto`}>
      <div className="scrollable-div whitespace-nowrap h-full flex items-center space-x-4 pl-4 overflow-auto">
        {events.map((event, index) => (
          <div key={index} className={darkMode ? 'text-white' : 'text-black'}>
            {event}
          </div>
        ))}
        <div ref={endOfDiv}></div>
      </div>
    </div>
  )
}
