import { draw, buildLayer, xyz, Layer, loop, circleCollidesWithPolygon, collisionCircle, collisionRect, vectorTo, vector } from "tiny-game-engine"
import { BABY_MAX_AGE, OLD_AGE } from "./game"
import { moveTowards, spawn, spawnBase, spawnRandomBase, Unit } from "./unit"
import { PracticeGoal } from "./unit.practice"
import { playRetreat, RetreatGoal, retreatGoal } from "./unit.retreat"

export function age(window: Window) {
  const young = spawn(xyz(), spawnBase(xyz(), 'a'))
  young.pos.cor = xyz(-young.dim.x * 2)
  const middle = spawn(xyz(), young.base)
  middle.age = OLD_AGE / 2
  middle.pos.cor = xyz()
  const old = spawn(xyz(), young.base)
  old.age = OLD_AGE
  old.pos.cor = xyz(young.dim.x * 2)

  clearScreen('age', window);

  [young, middle, old].map(unit => {
    drawUnit(unit, unit.layer)
    draw(ctx => ctx.drawImage(unit.layer.canvas, unit.pos.cor.x, unit.pos.cor.y), unit.dim)
  })
}

export function move(window: Window) {
  const young = spawn(xyz(), spawnRandomBase())
  young.goal = retreatGoal(young)
  young.goal.targetDistance = 0
  young.pos.cor = xyz(-young.dim.x)
  const middle = spawn(xyz(), spawnRandomBase())
  middle.age = OLD_AGE / 2
  middle.goal = retreatGoal(middle)
  middle.goal.targetDistance = 0
  const old = spawn(xyz(), spawnRandomBase())
  old.age = OLD_AGE
  old.pos.cor = xyz(old.dim.x)
  old.goal = retreatGoal(old)
  old.goal.targetDistance = 0
  
  loop((step) => {
    clearScreen('move', window);

    [young, middle, old].map(unit => {
      playRetreat(step, unit as Unit & { goal: RetreatGoal })
      if (circleCollidesWithPolygon(collisionCircle(unit), collisionRect(unit.base))) {
        unit.base.pos.cor = xyz((Math.random() > 0.5 ? -1 : 1) * Math.random() * 100, -Math.random() * 100)
      }  
      drawUnit(unit, unit.layer)
      draw(ctx => ctx.drawImage(unit.layer.canvas, unit.pos.cor.x, unit.pos.cor.y), unit.dim)
    })
  })
}

function clearScreen(scenarioName: string, window: Window) {
  draw((ctx, cw, ch) => {
    ctx.fillStyle = 'black'
    ctx.fillRect(-cw, -ch, 2*cw, 2*ch)
    ctx.fillStyle = 'white'
    ctx.font = '16px serif';
    ctx.textAlign = 'center'
    ctx.fillText(scenarioName, 0, 50);
  }, undefined, undefined, window)
}

function easeInExpo (t, b, c, d) {
  return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
}

function drawUnit(unit: Unit, l: Layer) {
  const size = unit.dim.x2 + (unit.age < BABY_MAX_AGE ? -2 : 0)
  const colorLightness = 50 + (unit.age < BABY_MAX_AGE ? 10 : unit.age < OLD_AGE ? 0 : -0)
  const ageColor = 100 + (unit.age < OLD_AGE ? 0 : -40)
  const eyeLightness = 0 + (unit.age < OLD_AGE ? 0 : 10)
  const ctx = l.context

  ctx.beginPath()
  ctx.fillStyle = `hsl(216, ${ageColor}%, ${colorLightness}%)`
  ctx.arc(unit.dim.x2, unit.dim.y2, size - 2, 0, Math.PI * 2)
  ctx.fill()
  
  // shadow
  ctx.beginPath()
  ctx.strokeStyle = `hsl(216, ${ageColor}%, 20%)`
  ctx.arc(unit.dim.x2, unit.dim.y2, size - 2, -Math.PI/2, Math.PI/2)
  ctx.stroke()

  // light
  ctx.beginPath()
  ctx.strokeStyle = `hsl(216, ${ageColor}%, ${colorLightness + 10}%)`
  ctx.arc(unit.dim.x2, unit.dim.y2, size - 3, Math.PI/2, -Math.PI/2)
  ctx.stroke()

  // eyes
  const lookingAt = unit.goal.target ? vectorTo(unit, unit.goal.target, size/2) : vector(0, size/2)
  ctx.beginPath()
  ctx.fillStyle = `hsl(216, ${eyeLightness}%, ${eyeLightness}%)`
  ctx.arc(unit.dim.x2 + Math.max(0, lookingAt.x), unit.dim.y2 + lookingAt.y, Math.max(1, Math.floor(unit.dim.x/10)), 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.fillStyle = `hsl(216, ${eyeLightness}%, ${eyeLightness}%)`
  ctx.arc(unit.dim.x2 + Math.min(lookingAt.x, 0), unit.dim.y2 + lookingAt.y, Math.max(1, Math.floor(unit.dim.x/10)), 0, Math.PI * 2)
  ctx.fill()
}