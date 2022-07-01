import { Entity, vectorTo, move, entity, position, XYZ, xyz } from 'tiny-game-engine/lib/index.js'
import { BABY_MAX_AGE } from './game'
import { attackGoal, AttackGoal } from './unit.attack'
import { mingleGoal, MingleGoal } from './unit.mingle'
import { practiceGoal, PracticeGoal } from './unit.practice'
import { restGoal, RestGoal } from './unit.rest'

export interface Unit extends Entity {
  goal: Goal
  speed: number
  age: number
  exhaustion: number
  endurance: number
  xp: number
  health: number
  maxHealth: number
  team: 'a' | 'b'
}

export type Goal = MingleGoal | RestGoal | PracticeGoal | AttackGoal

export function spawn(cor: XYZ): Unit {
  return entity<Unit>(position(cor), xyz(10), xyz(), {
    goal: restGoal(),
    speed: 1,
    age: 0,
    exhaustion: 0,
    endurance: 100,
    xp: 0,
    health: 100,
    maxHealth: 100,
    team: Math.random() > 0.5 ? 'a' : 'b',
  })
}

export function chooseCalmGoal(unit: Unit): Goal {
  if (unit.goal.type === 'rest' && unit.exhaustion > 0) return unit.goal

  if (unit.exhaustion >= unit.endurance) return restGoal()

  if (unit.goal.type === 'mingle' && unit.exhaustion < unit.endurance) return unit.goal

  if (unit.age > BABY_MAX_AGE && unit.exhaustion < unit.endurance) {
    return (unit.goal.type === 'mingle') ? unit.goal : mingleGoal(unit)
  }

  return (unit.goal.type === 'practice') ? unit.goal : practiceGoal(unit)
}

export function chooseBattleGoal(unit: Unit): Goal {
  if (unit.goal.type === 'mingle') return unit.goal

  if (unit.age > BABY_MAX_AGE && unit.exhaustion < unit.endurance) return attackGoal(unit)

  return chooseCalmGoal(unit)
}

export function moveTowards(step: number, unit: Unit, target: Unit) {
  unit.dir = vectorTo(unit, target, unit.speed)
  unit.pos.vel = unit.dir
  unit.pos = move(unit.pos, step)
}

