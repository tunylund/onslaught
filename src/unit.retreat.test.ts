import { expect } from '@esm-bundle/chai';
import { distance, xyz } from 'tiny-game-engine/lib/index.js'
import { MIN_DISTANCE_FROM_BASE, SAFE_DISTANCE_FROM_BASE } from './game';
import { Base, spawn, spawnBase, Unit } from './unit';
import { playRetreat, retreatGoal, RetreatGoal } from './unit.retreat';

describe('retreat', () => {

  let unit: Unit & { goal: RetreatGoal }
  let base: Base

  beforeEach(() => {
    base = spawnBase(xyz(300, 0, 0), 'a')
    unit = spawn(xyz(), base) as Unit & { goal: RetreatGoal }
    unit.goal = retreatGoal(0.5)
  })

  describe('retreatGoal', () => {
    it('should choose a location between min and safe distance from base', () => {
      expect(unit.goal.targetDistance).to.be.lessThan(SAFE_DISTANCE_FROM_BASE)
      expect(unit.goal.targetDistance).to.be.greaterThan(MIN_DISTANCE_FROM_BASE)
    })
  })

  it('should move towards base', () => {
    const distanceBefore = distance(unit, base)
    playRetreat(1, unit)
    expect(distance(unit, base)).to.be.lessThan(distanceBefore)
  })

  it('should not move towards base if close enough', () => {
    unit.pos.cor = base.pos.cor
    const distanceBefore = distance(unit, base)
    playRetreat(1, unit)
    expect(distance(unit, base)).not.to.be.lessThan(distanceBefore)
  })
})