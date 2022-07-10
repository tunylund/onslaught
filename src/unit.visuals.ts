import { draw, buildLayer, xyz, Layer } from "tiny-game-engine"
import { OLD_AGE } from "./game"
import { spawn, spawnBase, Unit } from "./unit"

export function age(window: Window) {
  const young = spawn(xyz(), spawnBase(xyz(), 'a'))
  young.pos.cor = xyz(-young.dim.x * 2)
  const middle = spawn(xyz(), young.base)
  middle.age = OLD_AGE / 2
  middle.pos.cor = xyz()
  const old = spawn(xyz(), young.base)
  old.age = OLD_AGE
  middle.pos.cor = xyz(young.dim.x * 2)

  clearScreen('age', window);

  [young, middle, old].map(unit => {
    const l = drawUnit(unit, window)
    draw(ctx => ctx.drawImage(l.canvas, unit.pos.cor.x, unit.pos.cor.y), unit.dim)
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

function drawUnit(unit: Unit, window: Window): Layer {
  const l = buildLayer(9, 9, window)
  const ctx = l.context
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, unit.dim.x, unit.dim.y)
  return l
}