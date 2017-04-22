import { Graphics } from 'pixi.js'
import Screen from './screen'

const BAR_COLOR = 0xFF0000
const BAR_WIDTH = 200
const BAR_HEIGHT = 10

export default class LoadingScreen extends Screen {
  constructor (...args) {
    super(...args)

    this._progress = 0
    this._graphics = new Graphics()
    this.addChild(this._graphics)
  }

  tick (delta) {
    const { width, height } = this._game

    this._graphics.clear()
    this._graphics.beginFill(BAR_COLOR, 1)
    this._graphics.drawRect(
      width / 2 - BAR_WIDTH / 2,
      height / 2 - BAR_HEIGHT / 2,
      this._progress * BAR_WIDTH,
      BAR_HEIGHT
    )
    this._graphics.endFill()
  }

  /**
   * Invoked when this screen is entered
   */
  enter () {
    this.loader.onProgress.add((loader) => {
      this._progress = loader.progress / 100
    })
  }
}
