import { Sprite, Point } from 'pixi.js'
import Screen from './screen'

export default class GameScreen extends Screen {
  constructor (...args) {
    super(...args)

    this.scale = new Point(2, 2)

    const floor = new Sprite(this._game.sprites.textures['floor.png'])
    floor.width = 800
    floor.height = 800
    this.addChild(floor)

    const stone = new Sprite(this._game.sprites.textures['stone.png'])
    stone.position = new Point(120, 105)
    this.addChild(stone)

    const character = new Sprite(this._game.sprites.textures['character.png'])
    character.position = new Point(100, 100)
    this.addChild(character)
  }

  tick (delta) {

  }
}
