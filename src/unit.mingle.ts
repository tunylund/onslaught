import { add, distance, vectorTo } from "tiny-game-engine/lib/index.js"
import { MINGLE_DURATION } from "./game"
import { moveTowards, spawn, Unit } from "./unit"

export interface MingleGoal {
  type: 'mingle'
  target?: Unit & { goal: MingleGoal }
  minDistance: number
  duration: number
  maxDuration: number
}

export function mingleGoal(unit: Unit): MingleGoal {
  return {
    type: 'mingle',
    minDistance: unit.dim.size,
    duration: 0,
    maxDuration: MINGLE_DURATION
  }
}

export function playMingle(step: number, unit: Unit & { goal: MingleGoal }, units: Unit[]): Unit|void {
  const goal = unit.goal as MingleGoal
  if (!goal.target) {
    const target = chooseMingleTarget(unit, units)
    if (target) {
      goal.target = target
      target.goal.target = unit as Unit & { goal: MingleGoal }
    }
  }
  else {
    const target = goal.target
    if (target.goal.type !== 'mingle') {
      unit.goal.target = undefined
    } else if (distance(unit, target) > goal.minDistance) {
      moveTowards(step, unit, target)
    } else {
      mingle(step, unit, target)
    }
  }
}

export function mingle(step: number, unit: Unit & { goal: MingleGoal }, target: Unit & { goal: MingleGoal }): Unit | void {
  if (unit.goal.duration >= unit.goal.maxDuration && target.goal.duration >= target.goal.maxDuration) {
    unit.exhaustion = unit.endurance
    target.exhaustion = target.endurance;
    return spawn(add(unit.pos.cor, vectorTo(unit, target, distance(unit, target) / 2) ), unit.base)
  } else {
    unit.goal.duration += step
  }
}

export function chooseMingleTarget(unit: Unit, units: Unit[]) {
  const availableUnits = units.filter(u =>
    u !== unit && 
    u.goal.type === 'mingle' && 
    !u.goal.target
  ) as (Unit & { goal: MingleGoal })[]
  return availableUnits.sort((a, b) => distance(a, b))[0]
}
