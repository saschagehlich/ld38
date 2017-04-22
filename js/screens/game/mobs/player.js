import { Sprite, Point } from 'pixi.js'
import Keyboard from '../../../lib/keyboard'
import Vector2 from '../../../lib/math/vector2'

const MIN_JETPACK_ALTITUDE = 50

export default class Player extends Sprite {
  constructor (game) {
    super()

    this._onJumpPressed = this._onJumpPressed.bind(this)

    this._game = game
    this._keyboard = new Keyboard()
    this._keyboard.on('down:space', this._onJumpPressed)

    this.onGround = false
    this.onPlanet = null
    this.onPlanetPosition = new Vector2(0, 0)

    this.texture = this._game.sprites.textures['character.png']
    this.anchor = new Point(0.5, 1)

    this._velocity = new Vector2(0, 0)
    this.walkSpeed = 150
    this.jumpForce = 500
    this.jetpackForce = 1600
  }

  tick (delta) {
    this._handleKeyboard()
    this._updatePosition(delta)
    this._updateJetPack(delta)

    if (this.onPlanet) {
      this._updatePositionOnPlanet()
    }
  }

  _updateJetPack (delta) {
    const minAltitudeReached = this._velocity.y > 0 &&
      this.onPlanetPosition.y >= MIN_JETPACK_ALTITUDE
    const spacePressed = this._keyboard.isKeyPressed('space')
    const jetpackActive = (
      ((this.onPlanet && minAltitudeReached) || !this.onPlanet) &&
      spacePressed
    )

    if (jetpackActive) {
      this._velocity.y += this.jetpackForce * delta
    }
  }

  _updatePosition (delta) {
    if (this.onPlanet) {
      const gravity = this.onPlanet.getGravityForAltitude(this.onPlanetPosition.y)
      const gravityStep = gravity.clone().multiply(delta)

      this._velocity.add(gravityStep)

      const velocityStep = this._velocity.clone().multiply(delta)
      this.onPlanetPosition.add(velocityStep)

      if (this.onPlanetPosition.y <= 0) {
        this.onGround = true
        this.onPlanetPosition.y = 0
      } else {
        this.onGround = false
      }
    }
  }

  _handleKeyboard () {
    if (this._keyboard.isKeyPressed('d') ||
      this._keyboard.isKeyPressed('right')) {
      this._velocity.x = this.walkSpeed
    } else if (this._keyboard.isKeyPressed('a') ||
      this._keyboard.isKeyPressed('left')) {
      this._velocity.x = -this.walkSpeed
    } else {
      this._velocity.x = 0
    }
  }

  _onJumpPressed () {
    this.jump()
  }

  jump () {
    if (!this.onGround) return

    this._velocity.y = this.jumpForce
  }

  _updatePositionOnPlanet () {
    if (this.walking) {
      this.onPlanetPosition.add(this.walkSpeed, 0)
    }

    const planet = this.onPlanet
    const onPlanetPosition = this.onPlanetPosition

    const circumfence = planet.radius * Math.PI * 2
    const radians = ((onPlanetPosition.x / circumfence) * 360) / 180 * Math.PI - Math.PI / 2

    const cos = Math.cos(radians)
    const sin = Math.sin(radians)

    const position = Vector2.fromPoint(planet.position)
      .add(
        cos * (planet.radius + onPlanetPosition.y),
        sin * (planet.radius + onPlanetPosition.y)
      )
    this.position.x = position.x
    this.position.y = position.y

    this.rotation = radians + Math.PI / 2
  }
}
