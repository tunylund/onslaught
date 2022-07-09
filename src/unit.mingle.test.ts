import { distance, xyz } from 'tiny-game-engine/lib/index.js'
import { expect } from '@esm-bundle/chai';
import { spawn, spawnBase, Unit } from './unit';
import { chooseMingleTarget, mingle, mingleGoal, MingleGoal, playMingle } from './unit.mingle';
import { restGoal } from './unit.rest';

describe('mingling', () => {

  let unitA: Unit & { goal: MingleGoal },
      unitB: Unit & { goal: MingleGoal }

  beforeEach(() => {
    unitA = spawn(xyz(), spawnBase(xyz(), 'a')) as Unit & { goal: MingleGoal }
    unitA.goal = mingleGoal(unitA)
    unitB = spawn(xyz(), unitA.base) as Unit & { goal: MingleGoal }
    unitB.goal = mingleGoal(unitB)
  })

  describe('chooseMingleTarget', () => {
    it('should choose another mingling to practice with', () => {
      expect(chooseMingleTarget(unitA, [unitA, unitB])).to.be.equal(unitB)
    })
  })

  describe('mingle', () => {
    it('should increase mingle duration', () => {
      mingle(1, unitA, unitB)
      expect(unitA.goal.mingleDuration).to.be.greaterThan(0)
    })

    it('should spawn a new unit if mingle is complete', () => {
      unitA.goal.mingleDuration = unitA.goal.maxDuration
      unitB.goal.mingleDuration = unitB.goal.maxDuration
      expect(mingle(1, unitA, unitB)).to.exist
    })

    it('should completely exhaust mingling units', () => {
      unitA.goal.mingleDuration = unitA.goal.maxDuration
      unitB.goal.mingleDuration = unitB.goal.maxDuration
      mingle(1, unitA, unitB)
      expect(unitA.exhaustion).to.be.greaterThanOrEqual(unitA.endurance)
      expect(unitB.exhaustion).to.be.greaterThanOrEqual(unitB.endurance)
    })
  })

  describe('playMingle', () => {

    beforeEach(() => {
      playMingle(1, unitA, [unitA, unitB])
    })

    it('should choose a target', () => {
      expect(unitA.goal.target).to.exist
      expect(unitB.goal.target).to.exist
    })

    it('should release the target if they stop mingling', () => {
      (unitB as Unit).goal = restGoal()
      playMingle(1, unitA, [unitA, unitB])
      expect(unitA.goal.target).to.be.undefined
    })

    it('should move closer', () => {
      unitA.pos.cor = xyz(20)
      const distanceBefore = distance(unitA, unitB)
      playMingle(1, unitA, [unitA, unitB])

      expect(distance(unitA, unitB)).to.be.lessThan(distanceBefore)
    })
  })
})