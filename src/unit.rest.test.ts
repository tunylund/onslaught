import { expect } from '@esm-bundle/chai';
import { xyz } from 'tiny-game-engine/lib/index.js';
import { spawn, Unit } from './unit';
import { playRest, restGoal, RestGoal } from './unit.rest';

describe('resting', () => {

  let unit: Unit & { goal: RestGoal }

  beforeEach(() => {
    unit = spawn(xyz()) as Unit & { goal: RestGoal }
    unit.goal = restGoal()
  })

  it('should decrease exhaustion', () => {
    unit.exhaustion = 2
    playRest(1, unit)
    expect(unit.exhaustion).to.be.lessThan(2)
  })
})