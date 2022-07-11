import { distance } from "tiny-game-engine/lib/index.js"
import { ATTACK_COOLDOWN, OLD_AGE } from "./game"
import { moveTowards, Unit } from "./unit"

export interface AttackGoal {
  type: 'attack'
  target?: Unit
  minDistance: number
  coolDown: number
  duration: number
}

export function attackGoal(unit: Unit): AttackGoal {
  return {
    type: 'attack',
    minDistance: unit.dim.size,
    coolDown: 0,
    duration: 0
  }
}

export function playAttack(step: number, unit: Unit & { goal: AttackGoal }, units: Unit[]) {
  const goal = unit.goal as AttackGoal
  if (!goal.target) {
    goal.target = chooseAttackTarget(unit, units)
  } else {
    const target = goal.target
    if (distance(unit, target) > goal.minDistance) {
      moveTowards(step, unit, target)
    } else {
      goal.duration += step
      if (goal.coolDown > 0) goal.coolDown -= step
      else {
        goal.duration = 0
        attack(step, unit, target)
      }
    }
  }
}

export function fightChance(unit: Unit): number {
  return unit.xp * (unit.age < OLD_AGE ? 1 : 0.75) - unit.exhaustion
}

export function attack(step: number, unit: Unit & { goal: AttackGoal }, target: Unit, luck = Math.random()) {
  unit.goal.coolDown = ATTACK_COOLDOWN
  if (fightChance(unit) > fightChance(target) || luck > 0.75) {
    target.health -= step
    unit.xp += step * 2
    unit.exhaustion += step
    target.exhaustion += step * 2
  } else {
    unit.xp += step
    unit.exhaustion += step
    target.exhaustion += step/2  
  }
}

export function chooseAttackTarget(unit: Unit, units: Unit[]) {
  const availableUnits = units.filter(u =>
    u !== unit && 
    u.team != unit.team
  )
  return availableUnits.sort((a, b) => distance(a, b))[0]
}
