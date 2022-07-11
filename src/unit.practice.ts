import { distance } from "tiny-game-engine/lib/index.js"
import { moveTowards, Unit } from "./unit"

export interface PracticeGoal {
  type: 'practice'
  minDistance: number
  target?: Unit & { goal: PracticeGoal }
  duration: number
}

export function practiceGoal(unit: Unit): PracticeGoal {
  return {
    type: 'practice',
    minDistance: unit.dim.size,
    duration: 0
  }
}

export function choosePracticeTarget(unit: Unit, units: Unit[]) {
  const availableUnits = units.filter(u =>
    u !== unit && 
    u.goal.type === 'practice' && 
    !u.goal.target &&
    u.age > unit.age
  ) as (Unit & { goal: PracticeGoal })[]
  return availableUnits.sort((a, b) => distance(a, b))[0]
}

export function practice(step: number, unit: Unit & { goal: PracticeGoal }, target: Unit) {
  unit.goal.duration += step
  unit.xp += step
  unit.exhaustion += step
  target.exhaustion += step/2
}

export function playPractice(step: number, unit: Unit & { goal: PracticeGoal }, units: Unit[]) {
  const goal = unit.goal as PracticeGoal
  if (!goal.target) {
    const target = choosePracticeTarget(unit, units)
    if (target) {
      goal.target = target
      target.goal.target = unit as Unit & { goal: PracticeGoal }
    }
  } else {
    const target = goal.target
    if (target.goal.type !== 'practice') {
      goal.target = undefined
    } else if (distance(unit, target) > goal.minDistance) {
      moveTowards(step, unit, target)
    } else {
      if (unit.age < target.age) practice(step, unit, target)
    }
  }
}