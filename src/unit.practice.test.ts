import { distance, xyz } from 'tiny-game-engine/lib/index.js'
import { spawn, Unit } from './unit'
import { playPractice, practiceGoal, choosePracticeTarget, practice, PracticeGoal } from './unit.practice'
import { expect } from '@esm-bundle/chai';
import { restGoal } from './unit.rest';

describe('practicing', () => {

  let younger: Unit & { goal: PracticeGoal },
      older: Unit & { goal: PracticeGoal }

  beforeEach(() => {
    younger = spawn(xyz()) as Unit & { goal: PracticeGoal }
    younger.goal = practiceGoal(younger)
    older = spawn(xyz()) as Unit & { goal: PracticeGoal }
    older.goal = practiceGoal(older)
    older.age += 1
  })

  describe('choosePracticeTarget', () => {
    it('should choose an older to practice with', () => {
      expect(choosePracticeTarget(younger, [younger, older])).to.equal(older)
    })
  })

  describe('practice', () => {
    it('should grow xp of younger', () => {
      practice(1, younger, older)
      expect(younger.xp).to.be.greaterThan(0)
    })

    it('should exhaust both', () => {
      practice(1, younger, older)
      expect(younger.exhaustion).to.be.greaterThan(0)
      expect(older.exhaustion).to.be.greaterThan(0)
    })

    it('should exhaust younger more', () => {
      practice(1, younger, older)
      expect(younger.exhaustion).to.be.greaterThan(older.exhaustion)
    })
  })

  describe('playPractice', () => {
    beforeEach(() => {
      playPractice(1, younger, [younger, older])
    })

    it('should choose a target', () => {
      expect(younger.goal.target).to.exist
      expect(older.goal.target).to.exist
    })

    it('should look for new target if the practice pair stops practicing', () => {
      (older as Unit).goal = restGoal()
      playPractice(1, younger, [younger, older])
      expect(younger.goal.target).to.be.undefined
    })

    it('should move closer', () => {
      younger.pos.cor = xyz(20)
      const distanceBefore = distance(younger, older)
      playPractice(1, younger, [younger, older])

      expect(distance(younger, older)).to.be.lessThan(distanceBefore)
    })

    it('should improve xp for the younger', () => {
      playPractice(1, younger, [younger, older])

      expect(younger.xp).to.be.greaterThan(0)
    })

    it('should not affect the xp of the older', () => {
      playPractice(1, older, [younger, older])

      expect(older.xp).to.equal(0)
    })
  })
})
