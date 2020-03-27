import BaseCharacter from './baseCharacter'
import { ILatlng } from '~/types/battle'

export default class PlayableCharacter extends BaseCharacter {
  private _lastLatLng: ILatlng = { x: -1, y: -1 }

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
}
