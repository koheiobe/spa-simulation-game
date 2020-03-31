import BaseCharacter from './baseCharacter'
import { ActionType, ILatlng } from '~/types/battle'

export default class PlayableCharacter extends BaseCharacter {
  private _lastLatLng: ILatlng = { x: -1, y: -1 }
  private _actionState: {
    name: ActionType | ''
    itemId?: number
  } = { name: '' }

  constructor({
    name,
    hp,
    attackPoint,
    defense,
    critical,
    luck,
    speed,
    level,
    moveDistance,
    id
  }: {
    name: string
    hp: number
    attackPoint: number
    defense: number
    critical: number
    luck: number
    speed: number
    level: number
    moveDistance: number
    id: number
  }) {
    super({
      name,
      hp,
      attackPoint,
      defense,
      critical,
      luck,
      speed,
      level,
      moveDistance,
      id
    })
  }

  set lastLatLng(latLng: ILatlng) {
    this._lastLatLng = latLng
  }

  get lastLatLng() {
    return this._lastLatLng
  }

  get actionState() {
    return this._actionState
  }

  set actionState(state) {
    this._actionState = state
  }

  get name() {
    return this._name
  }

  get hp() {
    return this._hp
  }

  get attackPoint() {
    return this._attackPoint
  }

  get defense() {
    return this._defense
  }

  get critical() {
    return this._critical
  }

  get luck() {
    return this._luck
  }

  get speed() {
    return this._speed
  }

  get level() {
    return this._level
  }

  get moveDistance() {
    return this._moveDistance
  }
}
