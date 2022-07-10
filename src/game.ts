import { buildLayer, draw, drawingLayer, loop, xyz } from 'tiny-game-engine/lib/index.js'
import { chooseBattleGoal, chooseCalmGoal, spawn, spawnBase, spawnRandom, Team, Unit } from './unit'
import { attackGoal, AttackGoal, playAttack } from './unit.attack'
import { MingleGoal, playMingle } from './unit.mingle'
import { playPractice } from './unit.practice'
import { playRest } from './unit.rest'

export const BABY_MAX_AGE = 5000
export const OLD_AGE = 25000
export const ATTACK_COOLDOWN = 1000
export const STAGE_DURATION = 15000
export const MINGLE_DURATION = 5000
export const SAFE_DISTANCE_FROM_BASE = 200
export const MIN_DISTANCE_FROM_BASE = 50
export const CRITICAL_HEALTH = 15

export interface Stage {
  type: 'calm' | 'battle' | 'end'
  duration: number
  maxDuration: number
}

export interface GameState {
  units: Unit[]
  stage: Stage
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

  const stopGameLoop = gameLoop()
  const stopDrawLoop = drawLoop()

}

function gameLoop() {
  return loop((step) => {
    state.stage.duration += step

    if (state.units.length === 0) state.units = initUnits()
    if (state.stage.type === 'calm') state.units.map(unit => calmLoop(step, unit, state.units))
    if (state.stage.type === 'battle') state.units.map(unit => battleLoop(step, unit, state.units))

    state.units = state.units.filter(unit => unit.health > 0)
    
    state.stage = chooseStage(state)
  })
}

export function drawLoop() {
  const unitA = spawn(xyz(), spawnBase(xyz(), 'a')) as Unit & { goal: AttackGoal }
  const unitB = spawn(xyz(), spawnBase(xyz(), 'b'))
  unitA.goal = attackGoal(unitA)
  const layer = buildLayer(3, 3)
  return loop((step) => {
    draw((ctx, cw, ch) => {
      ctx.fillStyle = 'black'
      ctx.fillRect(-cw, -ch, 2*cw, 2*ch)
      ctx.fillStyle = 'white'
      ctx.font = '16px serif';
      ctx.textAlign = 'center'
      ctx.fillText('Attack', 10, 50);

      ctx.fillStyle = 'white'
      ctx.fillRect(unitA.pos.cor.x, unitA.pos.cor.y, unitA.dim.x, unitA.dim.y)
    })
    playAttack(step, unitA, [unitA, unitB])
  })
}

function initUnits(): Unit[] {
  const baseA = spawnBase(xyz(-200), 'a')
  const baseB = spawnBase(xyz(200), 'a')
  return [spawnRandom(baseA), spawnRandom(baseA), spawnRandom(baseA), spawnRandom(baseA),
          spawnRandom(baseB), spawnRandom(baseB), spawnRandom(baseB), spawnRandom(baseB)]
}

export function chooseStage(state: GameState): Stage {
  const teamCount = state.units.reduce((count: { a: number, b: number }, unit: Unit) => {
    ++count[unit.team]
    return count
  }, {a: 0, b: 0})

  if (teamCount.a === 0 || teamCount.b === 0) {
    return {
      type: 'end',
      duration: 0,
      maxDuration: STAGE_DURATION
    }
  } else if (state.stage.duration > state.stage.maxDuration) {
    return state.stage.type === 'calm' ? {
      type: 'battle',
      duration: 0,
      maxDuration: STAGE_DURATION
    } : {
      type: 'calm',
      duration: 0,
      maxDuration: STAGE_DURATION
    }
  } else return state.stage
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
