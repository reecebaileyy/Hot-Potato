import React, { useState, useRef, useEffect, useCallback } from 'react'

interface MobileSwipeNavigationProps {
  darkMode: boolean
  children: React.ReactNode[]
  sectionNames: string[]
}

export default function MobileSwipeNavigation({
  darkMode,
  children,
  sectionNames
}: MobileSwipeNavigationProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number, y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Minimum distance for a swipe
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    const touch = e.targetTouches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
  }

  const onTouchMove = (e: React.TouchEvent) => {
    const touch = e.targetTouches[0]
    setTouchEnd({ x: touch.clientX, y: touch.clientY })
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distanceX = touchStart.x - touchEnd.x
    const distanceY = touchStart.y - touchEnd.y
    
    // Only trigger swipe if horizontal movement is greater than vertical
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY) * 1.5
    
    if (!isHorizontalSwipe) {
      setTouchStart(null)
      setTouchEnd(null)
      return
    }
    
    const isLeftSwipe = distanceX > minSwipeDistance
    const isRightSwipe = distanceX < -minSwipeDistance

    if (isLeftSwipe && activeIndex < children.length - 1) {
      setActiveIndex(activeIndex + 1)
    }
    if (isRightSwipe && activeIndex > 0) {
      setActiveIndex(activeIndex - 1)
    }
    
    // Reset touch states
    setTouchStart(null)
    setTouchEnd(null)
  }

  const goToSection = (index: number) => {
    setActiveIndex(index)
  }

  const updateTransform = useCallback(() => {
    if (containerRef.current && containerRef.current.parentElement) {
      const parentWidth = containerRef.current.parentElement.clientWidth
      const transform = `translateX(-${activeIndex * parentWidth}px)`
      containerRef.current.style.transform = transform
    }
  }, [activeIndex])

  useEffect(() => {
    updateTransform()
  }, [activeIndex, children.length, updateTransform])

  useEffect(() => {
    // Handle window resize
    const handleResize = () => {
      updateTransform()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [updateTransform])

  return (
    <div className="w-full h-full flex flex-col">
      {/* Navigation Tabs */}
      <div className="flex justify-center mb-3 px-4">
        <div className="flex space-x-1 sm:space-x-2 bg-gray-200 dark:bg-gray-700 rounded-lg p-1 w-full max-w-md">
          {sectionNames.map((name, index) => (
            <button
              key={index}
              onClick={() => goToSection(index)}
              className={`flex-1 px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeIndex === index
                  ? `${darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'} shadow-sm`
                  : `${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Swipeable Content */}
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={containerRef}
          className="flex h-full transition-transform duration-300 ease-in-out"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {children.map((child, index) => (
            <div
              key={index}
              className="flex-shrink-0 h-full w-full"
            >
              <div className="h-full w-full px-4">
                {child}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Swipe Indicators */}
      <div className="flex justify-center mt-3 pb-2 space-x-2">
        {sectionNames.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSection(index)}
            aria-label={`Go to ${sectionNames[index]}`}
            className={`w-2 h-2 rounded-full transition-colors ${
              activeIndex === index
                ? darkMode ? 'bg-white' : 'bg-gray-900'
                : darkMode ? 'bg-gray-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
