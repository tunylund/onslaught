import { expect } from "@esm-bundle/chai"
import { distance, xyz } from "tiny-game-engine"
import { BABY_MAX_AGE, CRITICAL_HEALTH, OLD_AGE, SAFE_DISTANCE_FROM_BASE } from "./game"
import { Base, chooseBattleGoal, chooseCalmGoal, moveTowards, spawn, spawnBase, spawnRandom, spawnRandomBase, Unit } from "./unit"
import { mingleGoal } from "./unit.mingle"
import { restGoal } from "./unit.rest"

describe('moveTowards', () => {

  let unit: Unit, base: Base
  beforeEach(() => {
    base = spawnBase(xyz(200), 'a')
    unit = spawn(xyz(), base)
  })

  it('should move slower if in critical health', () => {
    const unitCritical = spawn(xyz(), base)
    unitCritical.health = CRITICAL_HEALTH
    moveTowards(1, unit, base)
    moveTowards(1, unitCritical, base)
    expect(distance(unit, base)).to.be.lessThan(distance(unitCritical, base))
  })

  it('should move slower if old', () => {
    const unitOld = spawn(xyz(), base)
    unitOld.age = OLD_AGE
    moveTowards(1, unit, base)
    moveTowards(1, unitOld, base)
    expect(distance(unit, base)).to.be.lessThan(distance(unitOld, base))
  })
})

describe('chooseCalmGoal', () => {

  let unit: Unit, base: Base

  beforeEach(() => {
    base = spawnRandomBase()
    unit = spawnRandom(base)
  })

  it('should choose to retreat to base if too far from the base', () => {
    unit.pos.cor = xyz(SAFE_DISTANCE_FROM_BASE + 1, 0, 0)
    expect(chooseCalmGoal(unit).type).to.equal('retreat')
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
    unit = spawnRandom(spawnRandomBase())
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

  it('should choose to retreat if in critical health', () => {
    unit.health = CRITICAL_HEALTH - 1
    expect(chooseBattleGoal(unit).type).to.equal('retreat')
  })

  it('should choose to practice', () => {
    expect(chooseBattleGoal(unit).type).to.equal('practice')
  })
})
