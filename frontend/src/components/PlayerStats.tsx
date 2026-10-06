import React from 'react'
import { Card, CardHeader, Stat } from './ui'

interface PlayerStatsProps {
  wins: number
  passes: number
  fails: number
  activeHands: number
}

/** The connected player's lifetime numbers. Claimable rewards live in the Rewards card next to it. */
export default function PlayerStats({ wins, passes, fails, activeHands }: PlayerStatsProps) {
  return (
    <Card>
      <CardHeader title="Your stats" />
      <div className="grid grid-cols-2 gap-x-4 gap-y-5">
        <Stat label="Wins" value={wins} />
        <Stat label="Passes" value={passes} />
        <Stat label="Fails" value={fails} hint="Explosions" />
        <Stat label="Active hands" value={activeHands} />
      </div>
    </Card>
  )
}
