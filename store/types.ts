export interface RootState {
  version: string
}

export interface IUser {
  user: {
    name: string
    battleId: string
    roomId: string
  }
}
