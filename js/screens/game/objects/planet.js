import { Point, Container, Graphics } from 'pixi.js'
import Vector2 from '../../../lib/math/vector2'

export default class Planet extends Container {
  static NO_GRAVITY_ALTITUDE = 400
  static FULL_GRAVITY_ALTITUDE = 200
  static LANDING_ALTITUDE = 600

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

    this.maxAltitude = Planet.NO_GRAVITY_ALTITUDE
    this.gravity = new Vector2(0, -1800)
  }

  tick (delta) {

  }

  getDistanceVectorToCenter (position) {
    return Vector2.fromPoint(position)
      .subtract(Vector2.fromPoint(this.position))
  }

  getDistanceToSurface (position) {
    const distanceVector = this.getDistanceVectorToCenter(position)

    return Math.sqrt(
      distanceVector.x * distanceVector.x +
      distanceVector.y * distanceVector.y
    ) - this.radius
  }

  getGravityForAltitude (altitude) {
    let multiplier
    if (altitude < Planet.FULL_GRAVITY_ALTITUDE) {
      multiplier = 1
    } else {
      const lessGravityZone = Planet.NO_GRAVITY_ALTITUDE - Planet.FULL_GRAVITY_ALTITUDE
      multiplier = Math.max(0, 1 - ((altitude - Planet.FULL_GRAVITY_ALTITUDE) / lessGravityZone))
    }

    return this.gravity.clone().multiply(multiplier)
  }
}
