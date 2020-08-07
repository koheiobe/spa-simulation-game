import { IDeployableArea, ILatlng } from '~/types/battle'

export default class DeployCellController {
  private deployableArea: { [key: string]: Boolean } = {}
  private hostDeployableAreas: IDeployableArea[]
  private guestDeployableAreas: IDeployableArea[]

  constructor(
    hostDeployableAreas: IDeployableArea[],
    guestDeployableAreas: IDeployableArea[]
  ) {
    this.hostDeployableAreas = hostDeployableAreas
    this.guestDeployableAreas = guestDeployableAreas
  }

  startDeployMode(isHostOrGuest: string) {
    const deployableAreas =
      isHostOrGuest === 'host'
        ? this.hostDeployableAreas
        : this.guestDeployableAreas
    this.deployableArea = this.fillDeployableArea(deployableAreas)
  }

  finishDeployMode() {
    if (this.isDeploying()) this.deployableArea = {}
  }

  isDeploying() {
    return Object.keys(this.deployableArea).length > 0
  }

  isDeployable(latLng: ILatlng) {
    return this.deployableArea[`${latLng.y}_${latLng.x}`]
  }

  private fillDeployableArea(
    deployableAreas: IDeployableArea[]
  ): { [key: string]: Boolean } {
    const filledDeployableArea: { [key: string]: Boolean } = {}
    deployableAreas.forEach((deployableArea) => {
      for (
        let i = deployableArea.upperLeft.y;
        i <= deployableArea.lowerLeft.y;
        i++
      ) {
        for (
          let j = deployableArea.upperLeft.x;
          j <= deployableArea.upperRight.x;
          j++
        ) {
          filledDeployableArea[`${i}_${j}`] = true
        }
      }
    })
    return filledDeployableArea
  }
}
