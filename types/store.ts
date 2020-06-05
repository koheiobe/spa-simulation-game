import { ILatlng, ActionType, SkillType } from '~/types/battle'

export interface IRootState {
  version: string
  battle: ICharacterState
  battleRoom: IBattleRoomState
  user: IUserState
}

export interface IBattleRoomState {
  list: IBattleRoomRes[]
  battleRoom?: IBattleRoomRes
}

export interface ICharacterState {
  characters: ICharacter[]
  interactiveCharacter: ICharacter | undefined
}

export interface IUserState {
  loginUser: IUser
}

export interface IUser {
  name: string
  uid: string
  battleId?: string
  roomId: string
  isLogin: boolean
}

export interface ICharacter {
  name: string
  maxHp: number
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
  skill: Array<SkillType>
  actionState: {
    name: ActionType
    itemId: number
    isEnd: boolean
    interactLatLng: ILatlng
  }
}

interface IBattleRoom {
  host: {
    uid: IUser['uid']
    name: IUser['name']
    opponentOfflineTimes: number
    isDeployModeEnd: boolean
  }
  guest: {
    uid: IUser['uid']
    name: IUser['name']
    opponentOfflineTimes: number
    isDeployModeEnd: boolean
  }
  winnerUid: string
  turn: {
    uid: string
    number: number
    updatedAt: any
  }
  lastInteractCharacter: ICharacter | null
  createdAt: any
}

// Firestoreの/battles/:id の初期化パラメーター
export interface IBattleRoomReq extends IBattleRoom {
  turn: {
    uid: string
    number: number
    updatedAt: firebase.firestore.FieldValue
  }
  createdAt: firebase.firestore.FieldValue
}

// Firestoreの/battles/:id のレスポンス
export interface IBattleRoomRes extends IBattleRoom {
  turn: {
    uid: string
    number: number
    updatedAt: firebase.firestore.Timestamp
  }
  createdAt: firebase.firestore.Timestamp
  // firestoreによって付与されるId
  id: string
}
