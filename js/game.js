import { SCALE_MODES, autoDetectRenderer, loaders, Container } from 'pixi.js'
import Stats from 'stats.js'

import LoadingScreen from './screens/loading-screen'
import GameScreen from './screens/game-screen'

class Game {
  constructor (container) {
    this._container = container

    this._createCanvas()
    this._initStats()
    this._initRenderer()

    this._container = new Container()
    this._running = false

    this._internalTick = this._internalTick.bind(this)
  }

  // -------------------------------------------------------------------------- INITIALIZATION

  /**
   * Creates, resizes and appends the canvas
   * @private
   */
  _createCanvas () {
    this._canvas = document.createElement('canvas')

    const { offsetWidth: width, offsetHeight: height } = this._container
    this._canvas.width = width
    this._canvas.height = height

    this._container.appendChild(this._canvas)
  }

  /**
   * Initializes and adds stats.js to the DOM
   * @private
   */
  _initStats () {
    this._stats = new Stats()
    this._container.appendChild(this._stats.dom)
  }

  /**
   * Initializes the PIXI.js renderer
   * @private
   */
  _initRenderer () {
    const { width, height } = this._canvas
    this._renderer = autoDetectRenderer({
      width,
      height,
      view: this._canvas,
      backgroundColor: 0x000000
    })
  }

  // -------------------------------------------------------------------------- PUBLIC API

  /**
   * Runs the game
   */
  run () {
    this._running = true

    this.openLoadingScreen()

    this._lastFrameAt = window.performance.now()
    this._lastFrameRequest = window.requestAnimationFrame(this._internalTick)
  }

  /**
   * Stops the game
   */
  stop () {
    this._running = false
    if (this._lastFrameRequest) {
      window.cancelAnimationFrame(this._lastFrameRequest)
    }
  }

  // -------------------------------------------------------------------------- LOOP

  /**
   * Internal tick function that calculates the delta to the last frame and calls the `tick`
   * and `render` methods
   * @private
   */
  _internalTick () {
    if (!this._running) return

    const now = window.performance.now()
    const delta = (now - this._lastFrameAt) / 1000

    this._stats.begin()

    this._tick(delta)
    this._render()

    this._stats.end()

    this._lastFrameAt = now
    this._lastFrameRequest = window.requestAnimationFrame(this._internalTick)
  }

  /**
   * Tick function, used for updates
   * @param  {Number} delta - Time passed since last frame (in seconds)
   * @private
   */
  _tick (delta) {
    this._screen && this._screen.tick(delta)
  }

  /**
   * Renders the game
   * @private
   */
  _render () {
    this._renderer.render(this._screen)
  }

  // -------------------------------------------------------------------------- SCREENS

  /**
   * Initializes the loading screen and the loader
   * @private
   */
  openLoadingScreen () {
    const loader = new loaders.Loader()
    loader.use((resource, next) => {
      if (resource.texture) {
        resource.texture.baseTexture.scaleMode = SCALE_MODES.NEAREST
      }
      next()
    })
    const screen = new LoadingScreen(this)

    this._loadAssets(loader)

    screen.loader = loader

    this.switchScreen(screen)

    loader.load((loader, resources) => {
      this.resources = resources
      this.openGameScreen()
    })
  }

  /**
   * Open the game screen
   * @private
   */
  openGameScreen () {
    const screen = new GameScreen(this)
    this.switchScreen(screen)
  }

  /**
   * Switches the active screen to the given one
   * @param  {Screen} screen
   */
  switchScreen (screen) {
    this._screen && this._screen.leave()
    this._screen = screen
    this._screen.enter()
  }

  // -------------------------------------------------------------------------- LOADING

  /**
   * Adds the assets to the loader's queue
   * @param  {PIXI.loaders.Loader} loader
   * @private
   */
  _loadAssets (loader) {
    loader.add('sprites', 'assets/sprites.json')
  }

  // -------------------------------------------------------------------------- GETTERS

  get width () { return this._canvas.width }
  get height () { return this._canvas.height }
  get sprites () { return this.resources.sprites }
}

window.addEventListener('load', () => {
  const canvas = document.querySelector('.js-container  ')
  const game = window.game = new Game(canvas)
  game.run()
})
