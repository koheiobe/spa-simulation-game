import { ILatlng, ActionType, SkillType, IField } from '~/types/battle'
import { FieldController } from '~/utility/helper/battle/field/index'

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
  deployCharacterId: string
}

export interface ICharacterLatLngMapState {
  charactersLatLngMap: IField
}

export interface IActiveCharacterState {
  activeCharacter: ICharacter
}

export interface IFieldState {
  fieldController: undefined | FieldController
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

interface battleRoomUser {
  uid: IUser['uid']
  name: IUser['name']
  opponentOfflineTimes: number
  isDeployModeEnd: boolean
}

interface IBattleRoom {
  host: battleRoomUser
  guest: battleRoomUser
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
  host: {
    uid: IUser['uid']
    name: IUser['name']
    opponentOfflineTimes: number
    isDeployModeEnd: boolean
    battleStartAt: firebase.firestore.FieldValue | null
  }
  guest: {
    uid: IUser['uid']
    name: IUser['name']
    opponentOfflineTimes: number
    isDeployModeEnd: boolean
    battleStartAt: firebase.firestore.FieldValue | null
  }
  turn: {
    uid: string
    number: number
    updatedAt: firebase.firestore.FieldValue
  }
  createdAt: firebase.firestore.FieldValue
}

// Firestoreの/battles/:id のレスポンス
export interface IBattleRoomRes extends IBattleRoom {
  host: {
    uid: IUser['uid']
    name: IUser['name']
    opponentOfflineTimes: number
    isDeployModeEnd: boolean
    battleStartAt: firebase.firestore.Timestamp | null
  }
  guest: {
    uid: IUser['uid']
    name: IUser['name']
    opponentOfflineTimes: number
    isDeployModeEnd: boolean
    battleStartAt: firebase.firestore.Timestamp | null
  }
  turn: {
    uid: string
    number: number
    updatedAt: firebase.firestore.Timestamp
  }
  createdAt: firebase.firestore.Timestamp
  // firestoreによって付与されるId
  id: string
}
