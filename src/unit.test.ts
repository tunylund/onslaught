import { expect } from "@esm-bundle/chai"
import { distance, xyz } from "tiny-game-engine/lib/index.js"
import { BABY_MAX_AGE } from "./game"
import { chooseBattleGoal, chooseCalmGoal, moveTowards, spawn, Unit } from "./unit"
import { mingle, mingleGoal } from "./unit.mingle"
import { restGoal } from "./unit.rest"

describe('moveTowards', () => {
  it('should move closer to the target', () => {
    const unitA = spawn(xyz(0))
    const unitB = spawn(xyz(20))
    const distanceBefore = distance(unitA, unitB)
    moveTowards(1, unitA, unitB)
    expect(distance(unitA, unitB)).to.be.lessThan(distanceBefore)
  })
})

describe('chooseCalmGoal', () => {

  let unit: Unit

  beforeEach(() => {
    unit = spawn(xyz())
  })

  it('should choose rest if the unit is exhausted', () => {
    unit.exhaustion = unit.endurance
    expect(chooseCalmGoal(unit).type).to.equal('rest')
  })

  it('should choose rest if the unit is resting and still exhausted', () => {
    unit.goal = restGoal()
    unit.exhaustion = 1
    expect(chooseCalmGoal(unit).type).to.equal('rest')
  })

  it('should choose to mingle if the unit is an adult', () => {
    unit.age = BABY_MAX_AGE + 1
    expect(chooseCalmGoal(unit).type).to.equal('mingle')
  })

  it('should choose to mingle if the unit is mingling and has energy', () => {
    unit.goal = mingleGoal(unit)
    unit.exhaustion = unit.endurance - 1
    expect(chooseCalmGoal(unit).type).to.equal('mingle')
  })

  it('should choose to practice', () => {
    expect(chooseCalmGoal(unit).type).to.equal('practice')
  })
})

describe('chooseBattleGoal', () => {
  let unit: Unit

  beforeEach(() => {
    unit = spawn(xyz())
  })

  it('should let mingling units keep on mingling', () => {
    unit.goal = mingleGoal(unit)
    expect(chooseBattleGoal(unit).type).to.equal('mingle')
  })

  it('should choose to attack if the unit is old enough', () => {
    unit.age = BABY_MAX_AGE + 1
    expect(chooseBattleGoal(unit).type).to.equal('attack')
  })

  it('should choose to rest if the unit is exhausted', () => {
    unit.age = BABY_MAX_AGE + 1
    unit.exhaustion = unit.endurance + 1
    expect(chooseBattleGoal(unit).type).to.equal('rest')
  })

  it('should choose to practice', () => {
    expect(chooseBattleGoal(unit).type).to.equal('practice')
  })
})
