import { Sprite, Point } from 'pixi.js'
import Planet from '../objects/planet'
import Keyboard from '../../../lib/keyboard'
import Vector2 from '../../../lib/math/vector2'

const MIN_JETPACK_ALTITUDE = 50
const MAX_VELOCITY = 300

export default class Player extends Sprite {
  constructor (game, gameScreen) {
    super()

    this._onJumpPressed = this._onJumpPressed.bind(this)

    this._game = game
    this._gameScreen = gameScreen

    this._keyboard = new Keyboard()
    this._keyboard.on('down:space', this._onJumpPressed)

    this.alive = true

    this.onGround = false
    this.onPlanet = null
    this.onPlanetPosition = new Vector2(0, 0)

    this.texture = this._game.sprites.textures['character.png']
    this.anchor = new Point(0.5, 1)

    this._velocity = new Vector2(0, 0)
    this.walkSpeed = 150
    this.jumpForce = 500
    this.jetpackForce = 200
    this.direction = 0

    this.rotationSpeed = (Math.PI * 2) * 0.5 // 0.2 * 360 degrees per second

    // Landing
    this._targetRotation = null
  }

  tick (delta) {
    this._handleKeyboard(delta)
    this._updatePosition(delta)
    this._updateJetPack(delta)

    if (this.onPlanet || this._landingOnPlanet) {
      this._updatePositionOnPlanet()
    } else {
      // Find closest planet, check if inside of gravity area
      this._closestPlanet = this._gameScreen.getClosestPlanet(this.position)
      this._canLandOnPlanet = this.isInsidePlanetLandingAltitude(this._closestPlanet)
    }

    if (this.onPlanet && this.onPlanetPosition.y > this.onPlanet.maxAltitude) {
      this._leavePlanet()
    }

    if (this._landingOnPlanet) {
      this._updateLandingManeuver(delta)
    }
  }

  _updateLandingManeuver (delta) {
    const currentRotation = this.rotation % Math.PI
    if (Math.abs(currentRotation - this._targetRotation) > this.rotationSpeed * delta) {
      if (currentRotation < this._targetRotation) {
        this.rotation += this.rotationSpeed * delta
      } else {
        this.rotation -= this.rotationSpeed * delta
      }
    }

    if (this.onGround && this._landingOnPlanet) {
      const currentRotation = this.rotation % Math.PI
      if (Math.abs(this._targetRotation - currentRotation) > this.rotationSpeed * delta) {
        this.dead = true
        console.log('FACE PLANT HAHA!')
      }

      this.onPlanet = this._closestPlanet
      this._landingOnPlanet = false
    }
  }

  isInsidePlanetLandingAltitude (planet) {
    const distanceToSurface = planet.getDistanceToSurface(this.position)
    return distanceToSurface <= Planet.LANDING_ALTITUDE
  }

  _leavePlanet () {
    this.onPlanet = null
  }

  _updateJetPack (delta) {
    const minAltitudeReached = this._velocity.y > 0 &&
      this.onPlanetPosition.y >= MIN_JETPACK_ALTITUDE
    const spacePressed = this._keyboard.isKeyPressed('space')
    const jetpackActive = (
      ((this.onPlanet && minAltitudeReached) || !this.onPlanet) &&
      spacePressed &&
      !this._landingOnPlanet
    )

    if (jetpackActive && (this.onPlanet || this._landingOnPlanet)) {
      this._velocity.y = this.jetpackForce
    } else if (jetpackActive) {
      const cos = Math.cos(this.rotation)
      const sin = Math.sin(this.rotation)

      this._velocity.add(
        10 * sin,
        10 * cos
      )
      this._velocity.clamp(
        -MAX_VELOCITY,
        MAX_VELOCITY
      )
    }
  }

  _updatePosition (delta) {
    if (this.onPlanet || this._landingOnPlanet) {
      const planet = this._landingOnPlanet ? this._closestPlanet : this.onPlanet
      const gravity = planet.getGravityForAltitude(this.onPlanetPosition.y)
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
    } else {
      const { spaceFriction } = this._gameScreen
      this._velocity.multiply(1 - spaceFriction)
      const velocityStep = this._velocity.clone().multiply(delta)

      this.position.x += velocityStep.x
      this.position.y -= velocityStep.y
    }
  }

  _handleKeyboard (delta) {
    if (this._landingOnPlanet) {
      // Disallow keyboard input while landing automatically
      return
    }

    if (this.onPlanet) {
      if (this._keyboard.isKeyPressed('d') ||
        this._keyboard.isKeyPressed('right')) {
        this._velocity.x = this.walkSpeed
      } else if (this._keyboard.isKeyPressed('a') ||
        this._keyboard.isKeyPressed('left')) {
        this._velocity.x = -this.walkSpeed
      } else {
        this._velocity.x = 0
      }
    } else {
      if (this._keyboard.isKeyPressed('d') ||
        this._keyboard.isKeyPressed('right')) {
        this.rotation += this.rotationSpeed * delta
      } else if (this._keyboard.isKeyPressed('a') ||
        this._keyboard.isKeyPressed('left')) {
        this.rotation += -this.rotationSpeed * delta
      }
    }

    const landing = this._keyboard.isKeyPressed('e') &&
      this._keyboard.getKeyPressedDuration('e') > 0.5
    if (this._canLandOnPlanet && landing) {
      this._landOnPlanet()
    }
  }

  _landOnPlanet () {
    this._landingOnPlanet = true

    // Calculate target rotation
    const distanceToPlanetCenter = this._closestPlanet.getDistanceVectorToCenter(this.position)
    const distanceToSurface = this._closestPlanet.getDistanceToSurface(this.position)
    const rotation = Math.atan2(
      distanceToPlanetCenter.y,
      distanceToPlanetCenter.x
    )

    const circumfence = this._closestPlanet.radius * Math.PI * 2

    this._targetRotation = rotation + Math.PI / 2
    this.onPlanetPosition = new Vector2(
      circumfence / (Math.PI * 2) * this._targetRotation,
      distanceToSurface
    )
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

    const planet = this._landingOnPlanet ? this._closestPlanet : this.onPlanet
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

    if (!this._landingOnPlanet) {
      this.rotation = radians + Math.PI / 2
    }
  }
}
