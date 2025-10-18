import React from 'react'
import Image from 'next/image'
import Explosion from '../../public/assets/images/Explosion.gif'

interface TimerProps {
  remainingTime: number | null
  explosion: boolean
  darkMode: boolean
}

export default function Timer({ remainingTime, explosion, darkMode }: TimerProps) {
  if (!remainingTime || remainingTime <= 0) {
    return null
  }

  return (
    <div className={`w-full col-start-1 col-end-9 md:w-2/3 lg:w-1/2 ${darkMode ? 'bg-red-900' : 'bg-red-100'} shadow rounded-xl p-4 text-center`}>
      <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-red-800'}`}>
        ⏰ {remainingTime} seconds until explosion!
      </h2>
      {explosion && (
        <div className="mt-4">
          <Image src={Explosion} alt="Explosion" width={200} height={200} />
        </div>
      )}
    </div>
  )
}
