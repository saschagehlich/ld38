import { Point } from 'pixi.js'

import Screen from './screen'
import Vector2 from '../lib/math/vector2'

import Player from './game/mobs/player'
import Planet from './game/objects/planet'

const MIN_PLANET_SIZE = 300
const MAX_PLANET_SIZE = 500

export default class GameScreen extends Screen {
  constructor (...args) {
    super(...args)

    this._cameraPosition = new Vector2(0, 0)
    this._planets = []

    this._generatePlanets()

    this._player = new Player(this._game)
    this._player.onPlanet = this._planets[0]
    this.addChild(this._player)
  }

  _generatePlanets () {
    for (let i = 0; i < 100; i++) {
      const radius = MIN_PLANET_SIZE + (MAX_PLANET_SIZE - MIN_PLANET_SIZE) * Math.random()
      const planet = new Planet(this._game, radius)
      this._planets.push(planet)
      this.addChild(planet)
    }
  }

  _updateCamera () {
    this._cameraPosition = Vector2.fromPoint(this._player.position)

    // Update container position so that it represents the camera
    // position
    const position = this._cameraPosition.clone().multiply(-1)
    const { width, height } = this._game
    position.add(width / 2, height / 2)
    this.position = new Point(position.x, position.y)
  }

  tick (delta) {
    this._player.tick(delta)
    this._planets.forEach(planet => planet.tick(delta))

    this._updateCamera()
  }
}
