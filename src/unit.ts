import { Entity, vectorTo, move, entity, position, XYZ, xyz, distance, Layer, buildLayer } from 'tiny-game-engine'
import { BABY_MAX_AGE, CRITICAL_HEALTH, OLD_AGE, SAFE_DISTANCE_FROM_BASE } from './game'
import { attackGoal, AttackGoal } from './unit.attack'
import { mingleGoal, MingleGoal } from './unit.mingle'
import { practiceGoal, PracticeGoal } from './unit.practice'
import { restGoal, RestGoal } from './unit.rest'
import { retreatGoal, RetreatGoal } from './unit.retreat'

export type Team = 'a' | 'b'

export interface Base extends Entity {
  team: Team
}

export interface Unit extends Entity {
  goal: Goal
  speed: number
  age: number
  exhaustion: number
  endurance: number
  xp: number
  health: number
  maxHealth: number
  team: Team
  base: Base
  layer: Layer
}

export type Goal = MingleGoal | RestGoal | PracticeGoal | AttackGoal | RetreatGoal

export function spawn(cor: XYZ, base: Base): Unit {
  const unitSize = 18
  return entity<Unit>(position(cor), xyz(unitSize, unitSize), xyz(), {
    goal: restGoal(),
    speed: 0.002,
    age: 0,
    exhaustion: 0,
    endurance: 100,
    xp: 0,
    health: 100,
    maxHealth: 100,
    team: base.team,
    base,
    layer: buildLayer(20, 20, window)
  })
}

export function spawnRandom(base: Base): Unit {
  const team = base.team
  const cor = xyz((team === 'a' ? 1 : -1) * Math.floor(Math.random() * 100),
                  Math.floor(Math.random() * 100))
  
  return spawn(cor, base)
}

export function chooseCalmGoal(unit: Unit): Goal {
  if (unit.goal.type === 'retreat' && distance(unit, unit.base) > unit.goal.targetDistance) return unit.goal

  if (distance(unit, unit.base) > SAFE_DISTANCE_FROM_BASE) return retreatGoal(unit)

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

  if (unit.health < CRITICAL_HEALTH) return retreatGoal(unit)

  return chooseCalmGoal(unit)
}

export function moveTowards(step: number, unit: Unit, target: Entity) {
  const speed = unit.speed * (unit.age >= OLD_AGE ? 0.8 : 1) * (unit.health <= CRITICAL_HEALTH ? 0.9 : 1)
  unit.pos.vel = xyz()
  unit.pos.acc = vectorTo(unit, target, speed)
  unit.pos = move(unit.pos, step)
}

export function spawnBase(cor: XYZ, team: Team): Base {
  return entity<Base>(position(cor), xyz(20), xyz(), {
    team
  })
}

export function spawnRandomBase(): Base {
  return spawnBase(xyz(), Math.random() > 0.5 ? 'a' : 'b')
}