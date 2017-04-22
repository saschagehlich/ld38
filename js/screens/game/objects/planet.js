import { Point, Container, Graphics } from 'pixi.js'
import Vector2 from '../../../lib/math/vector2'

const FULL_GRAVITY_ALTITUDE = 150
const NO_GRAVITY_ALTITUDE = 200

export default class Planet extends Container {
  constructor (game, radius) {
    super()

    this._game = game
    this.radius = radius

    this.position = new Point(Math.random() * 50000, Math.random() * 50000)

    this._graphics = new Graphics()
    this._graphics.beginFill(0x555555, 1)
    this._graphics.drawCircle(0, 0, this.radius)
    this._graphics.endFill()
    this.addChild(this._graphics)

    this.gravity = new Vector2(0, -1800)
  }

  tick (delta) {

  }

  getGravityForAltitude (altitude) {
    let multiplier
    if (altitude < FULL_GRAVITY_ALTITUDE) {
      multiplier = 1
    } else if (altitude > NO_GRAVITY_ALTITUDE) {
      multiplier = 0
    } else {
      const lessGravityZone = NO_GRAVITY_ALTITUDE - FULL_GRAVITY_ALTITUDE
      multiplier = (altitude - FULL_GRAVITY_ALTITUDE) / lessGravityZone
    }

    return this.gravity.clone().multiply(multiplier)
  }
}