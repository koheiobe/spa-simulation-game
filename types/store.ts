export interface RootState {
  version: string
}

export interface IUser {
  name: string
  battleId: string
  roomId: string
  isLogin: boolean
}

export interface UserState {
  user: IUser
}
