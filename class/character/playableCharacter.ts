import BaseCharacter from './baseCharacter'

export default class PlayableCharacter extends BaseCharacter {
  private _isDeployed: boolean = false

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

  get isDeployed() {
    return this._isDeployed
  }

  set isDeployed(bool: boolean) {
    this._isDeployed = bool
  }
}
