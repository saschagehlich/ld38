import { Container } from 'pixi.js'

export default class Screen extends Container {
  constructor (game) {
    super()
    this._game = game
  }

  /**
   * Tick method
   * @param  {Number} delta - Time since last tick
   */
  tick (delta) {

  }

  /**
   * Invoked when this screen is entered
   */
  enter () {

  }

  /**
   * Invoked when this screen is left
   */
  leave () {

  }
}
