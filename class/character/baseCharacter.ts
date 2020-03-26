import { ILatlng } from '~/types/battle'

export default class BaseCharacter {
  private _name: string
  private _hp: number
  private _attackPoint: number
  private _defense: number
  private _critical: number
  private _luck: number
  private _speed: number
  private _level: number
  private _moveDistance: number
  private _id: number

  private _latLng: ILatlng = {
    x: -1,
    y: -1
  }

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
    this._name = name
    this._hp = hp
    this._attackPoint = attackPoint
    this._defense = defense
    this._critical = critical
    this._luck = luck
    this._speed = speed
    this._level = level
    this._moveDistance = moveDistance
    this._id = id
  }

  set latLng(latLng: ILatlng) {
    this._latLng = latLng
  }

  get latLng() {
    return this._latLng
  }

  get id() {
    return this._id
  }
}
