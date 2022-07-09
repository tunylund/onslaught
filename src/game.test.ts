import { expect } from "@esm-bundle/chai"
import { xyz } from 'tiny-game-engine/lib/index.js'
import { chooseStage, GameState, Stage } from "./game"
import { spawn, spawnBase, Unit } from "./unit"

describe('game', () => {

  let unitA: Unit, unitB: Unit, units: Unit[], stage: Stage
  beforeEach(() => {
    unitA = spawn(xyz(), spawnBase(xyz(), 'a'))
    unitB = spawn(xyz(), spawnBase(xyz(), 'b'))
    units = [unitA, unitB]
    stage = { type: 'calm', duration: 0, maxDuration: 1 }
  })

  describe('choose stage', () => {
    it('should choose end stage when there is only one team left', () => {
      expect(chooseStage({
        stage, units: [unitA]
      })).to.include({ type: 'end' })
    })

    it('should return the given stage when duration is less than max', () => {
      const state: GameState = { stage, units }
      expect(chooseStage(state)).to.equal(state.stage)
    })

    it('should switch to battle when duration exceeds maxduration', () => {
      const state: GameState = {
        stage: { type: 'calm', duration: 2, maxDuration: 1 },
        units
      }
      expect(chooseStage(state)).to.include({ type: 'battle' })
    })

    it('should switch to calm when duration exceeds maxduration', () => {
      const state: GameState = {
        stage: { type: 'battle', duration: 2, maxDuration: 1 },
        units
      }
      expect(chooseStage(state)).to.include({ type: 'calm' })
    })
  })
})
