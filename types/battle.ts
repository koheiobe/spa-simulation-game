export interface ILatlng {
  x: number
  y: number
}

export interface IDeployableArea {
  upperLeft: ILatlng
  upperRight: ILatlng
  lowerLeft: ILatlng
  lowerRight: ILatlng
}

export type ActionType = 'attack' | 'wait' | 'item' | 'none'

export type WeaponType = 'closeRange' | 'projectile' | 'other'

export type CellType = 'deploy' | 'move' | 'interact' | 'selectCharacter'
