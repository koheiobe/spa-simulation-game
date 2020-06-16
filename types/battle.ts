export interface IField {
  [latLng: string]: {
    type: string
  }
}

export interface ILatlng {
  x: number
  y: number
}

export interface IMovableArea {
  [key: string]: number
}

export interface IDeployableArea {
  upperLeft: ILatlng
  upperRight: ILatlng
  lowerLeft: ILatlng
  lowerRight: ILatlng
}

export type ActionType = 'attack' | 'wait' | 'item' | ''

export type WeaponType = 'closeRange' | 'projectile' | 'other'

export type CellType = 'deploy' | 'move' | 'interact' | null

export type SkillType =
  | 'undead'
  | 'sequncialAttack'
  | 'counter'
  | 'fly'
  | 'bloodSucking'
  | 'summonOnDead'
  | 'deadlyAttack'
