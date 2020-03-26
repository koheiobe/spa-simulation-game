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
