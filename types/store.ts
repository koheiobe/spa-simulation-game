import { ILatlng, ActionType } from '~/types/battle'

export interface RootState {
  version: string
}

export interface IUser {
  name: string
  uid: string
  battleId: string
  roomId: string
  isLogin: boolean
}

export interface ICharacter {
  name: string
  hp: number
  attackPoint: number
  critical: number
  defense: number
  luck: number
  speed: number
  level: number
  moveDistance: number
  id: string
  latLng: ILatlng
  lastLatLng: ILatlng
  actionState: {
    name: ActionType | ''
    itemId: number
  }
}

export interface IBattleRoom {
  creater: { uid: IUser['uid']; name: IUser['name'] }
  opponent: { uid: IUser['uid']; name: IUser['name'] }
}
