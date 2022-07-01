import { expect } from "@esm-bundle/chai"
import { distance, xyz } from "tiny-game-engine"
import { OLD_AGE } from "./game"
import { spawn, Unit } from "./unit"
import { attack, attackGoal, AttackGoal, chooseAttackTarget, fightChance, playAttack } from "./unit.attack"

describe('attacking', () => {

  let unitA: Unit & { goal: AttackGoal },
      unitB: Unit & { goal: AttackGoal }

  beforeEach(() => {
    unitA = spawn(xyz()) as Unit & { goal: AttackGoal }
    unitA.goal = attackGoal(unitA)
    unitA.team = 'a'
    unitB = spawn(xyz()) as Unit & { goal: AttackGoal }
    unitB.goal = attackGoal(unitB)
    unitB.team = 'b'
  })

  describe('chooseAttackTarget', () => {
    it('should choose closest from the enemy to attack', () => {
      expect(chooseAttackTarget(unitA, [unitA, unitB])).to.equal(unitB)
    })
  })

  describe('fightChance', () => {
    it('should be 0 for unit with no xp', () => {
      expect(fightChance(unitA)).to.equal(0)
    })
    it('should be determined by xp', () => {
      unitA.xp = 2
      unitA.age = 1
      expect(fightChance(unitA)).to.equal(2)
    })
    it('should be less than xp for old units', () => {
      unitA.xp = 2
      unitA.age = OLD_AGE
      expect(fightChance(unitA)).to.be.lessThan(2)
    })
    it('should be affected by exhaustion', () => {
      unitA.xp = 2
      unitA.age = 1
      unitA.exhaustion = 1
      expect(fightChance(unitA)).to.be.lessThan(2)
    })
  })

  describe('attack', () => {
    it('should limit attack speed with a cooldown', () => {
      attack(1, unitA, unitB)
      expect(unitA.goal.coolDown).to.be.greaterThan(0)
    })
    it('should reduce the targets health', () => {
      attack(1, unitA, unitB, 1)
      expect(unitB.health).to.be.lessThan(unitA.health)
    })
    it('should exhaust both', () => {
      attack(1, unitA, unitB)
      expect(unitA.exhaustion).to.be.greaterThan(0)
      expect(unitB.exhaustion).to.be.greaterThan(0)
    })
    it('should exhaust unitB more on succesful attack', () => {
      attack(1, unitA, unitB, 1)
      expect(unitB.exhaustion).to.be.greaterThan(unitA.exhaustion)
    })
    it('should exhaust unitA more on a missed attack', () => {
      attack(1, unitA, unitB, 0)
      expect(unitA.exhaustion).to.be.greaterThan(unitB.exhaustion)
    })
    it('should increase xp of the attacker', () => {
      let xpBefore = unitA.xp
      attack(1, unitA, unitB, 1)
      expect(unitA.xp).to.be.greaterThan(xpBefore)
    })
  })

  describe('playAttack', () => {

    beforeEach(() => {
      playAttack(1, unitA, [unitA, unitB])
    })

    it('should choose a target', () => {
      expect(unitA.goal.target).to.exist
    })

    it('should move closer', () => {
      unitA.pos.cor = xyz(20)
      const distanceBefore = distance(unitA, unitB)
      playAttack(1, unitA, [unitA, unitB])

      expect(distance(unitA, unitB)).to.be.lessThan(distanceBefore)
    })

    it('should decrease the cooldown', () => {
      unitA.goal.coolDown = 1
      playAttack(1, unitA, [unitA, unitB])
      expect(unitA.goal.coolDown).to.be.lessThan(1)
    })
  })
})
