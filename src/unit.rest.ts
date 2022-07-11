import { Unit } from "./unit"

export interface RestGoal {
  type: 'rest'
  duration: number
  target?: Unit
}

export function restGoal(): RestGoal {
  return {
    type: 'rest',
    duration: 0
  }
}

export function playRest(step: number, unit: Unit) {
  const goal = unit.goal as RestGoal
  goal.duration += step
  unit.exhaustion -= step
  unit.health = Math.min(unit.health + step/2, unit.maxHealth)
  if (unit.exhaustion <= 0) {
    unit.exhaustion = 0
  }
}

