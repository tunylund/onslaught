import { loop } from 'tiny-game-engine/lib/index.js'
import { chooseBattleGoal, chooseCalmGoal, Unit } from './unit'
import { AttackGoal, playAttack } from './unit.attack'
import { MingleGoal, playMingle } from './unit.mingle'
import { playPractice } from './unit.practice'
import { playRest } from './unit.rest'

export const BABY_MAX_AGE = 5000
export const OLD_AGE = 25000
export const ATTACK_COOLDOWN = 1000
export const STAGE_DURATION = 15000
export const MINGLE_DURATION = 5000

interface GameState {
  units: Unit[]
  stage: {
    type: 'calm' | 'battle'
    duration: number
    maxDuration: number
  }
}

const state: GameState = {
  units: [],
  stage: {
    type: 'calm',
    duration: 0,
    maxDuration: 15000
  }
}

function onslaught() {

  loop((step) => {
    state.stage.duration += step

    if (state.stage.type === 'calm') state.units.map(unit => calmLoop(step, unit, state.units))
    if (state.stage.type === 'battle') state.units.map(unit => battleLoop(step, unit, state.units))

    state.units = state.units.filter(unit => unit.health > 0)
    
    if (state.stage.duration > state.stage.maxDuration) {
      state.stage = state.stage.type === 'calm' ? {
        type: 'battle',
        duration: 0,
        maxDuration: STAGE_DURATION
      } : {
        type: 'calm',
        duration: 0,
        maxDuration: STAGE_DURATION
      }
    }
  })

}

function calmLoop(step: number, unit: Unit, units: Unit[]) {
  unit.age += step

  unit.goal = chooseCalmGoal(unit)

  if (unit.goal.type === 'mingle') {
    const spawnedUnit = playMingle(step, unit as Unit & { goal: MingleGoal }, units)
    if (spawnedUnit) units.push(spawnedUnit)
  }

  if (unit.goal.type === 'rest') {
    playRest(step, unit)
  }

  if (unit.goal.type === 'practice') {
    playPractice(step, unit, units)
  }
}

function battleLoop(step: number, unit: Unit, units: Unit[]) {
  unit.age += step

  unit.goal = chooseBattleGoal(unit)

  if (unit.goal.type === 'attack') playAttack(step, unit as Unit & { goal: AttackGoal }, state.units)
}

