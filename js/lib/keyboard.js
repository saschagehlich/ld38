import { EventEmitter } from 'events'

export default class Keyboard extends EventEmitter {
  constructor (...args) {
    super(...args)

    this._keys = {}
    this._keyCodeMap = {}

    for (let key in Keyboard.KeyCodes) {
      this._keys[key] = false
      this._keyCodeMap[Keyboard.KeyCodes[key]] = key
    }

    this._onKeyDown = this._onKeyDown.bind(this)
    this._onKeyUp = this._onKeyUp.bind(this)
    this._onKeyPressed = this._onKeyPressed.bind(this)
    this._listen()
  }

  _listen () {
    document.addEventListener('keydown', this._onKeyDown)
    document.addEventListener('keyup', this._onKeyUp)
    document.addEventListener('keypressed', this._onKeyPressed)
  }

  _onKeyDown (e) {
    const key = this._keyCodeMap[e.keyCode]
    this._keys[key] = true
    this.emit('down', key)
    this.emit(`down:${key}`)
  }

  _onKeyUp (e) {
    const key = this._keyCodeMap[e.keyCode]
    this._keys[key] = false
    this.emit('up', key)
    this.emit(`up:${key}`)
  }

  _onKeyPressed (e) {
    const key = this._keyCodeMap[e.keyCode]
    this.emit('pressed', key)
    this.emit(`pressed:${key}`)
  }

  isKeyPressed (key) {
    return this._keys[key]
  }

  dispose () {
    document.removeEventListener('keydown', this._onKeyDown)
    document.removeEventListener('keyup', this._onKeyUp)
    document.removeEventListener('keypressed', this._onKeyPressed)
  }
}

Keyboard.KeyCodes = {
  space: 32,
  a: 65,
  d: 68,
  left: 37,
  right: 39,
  ctrl: 17
}
