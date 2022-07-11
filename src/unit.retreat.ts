import { distance } from 'tiny-game-engine/lib/index.js'
import { SAFE_DISTANCE_FROM_BASE, MIN_DISTANCE_FROM_BASE } from "./game";
import { Base, moveTowards, Unit } from "./unit";

export interface RetreatGoal {
  type: 'retreat'
  target: Base
  targetDistance: number
  duration: number
}

export function retreatGoal(unit: Unit, random = Math.random()): RetreatGoal {
  return {
    type: 'retreat',
    target: unit.base,
    targetDistance: MIN_DISTANCE_FROM_BASE + (SAFE_DISTANCE_FROM_BASE - MIN_DISTANCE_FROM_BASE) * random,
    duration: 0
  }
}
export function playRetreat(step: number, unit: Unit & { goal: RetreatGoal }) {
  unit.goal.duration += step
  if (distance(unit, unit.base) > unit.goal.targetDistance) moveTowards(step, unit, unit.base)
}