import { distance } from 'tiny-game-engine/lib/index.js'
import { SAFE_DISTANCE_FROM_BASE, MIN_DISTANCE_FROM_BASE } from "./game";
import { moveTowards, Unit } from "./unit";

export interface RetreatGoal {
  type: 'retreat'
  targetDistance: number
}

export function retreatGoal(random = Math.random()): RetreatGoal {
  return {
    type: 'retreat',
    targetDistance: MIN_DISTANCE_FROM_BASE + (SAFE_DISTANCE_FROM_BASE - MIN_DISTANCE_FROM_BASE) * random
  }
}
export function playRetreat(step: number, unit: Unit & { goal: RetreatGoal }) {
  if (distance(unit, unit.base) > unit.goal.targetDistance) moveTowards(step, unit, unit.base)
}