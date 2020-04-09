import { IDeployableArea, ILatlng, WeaponType, CellType } from '~/types/battle'

export default class {
  private deployableArea: { [key: string]: Boolean } = {}
  private movableArea: { [key: string]: Boolean } = {}
  private interactiveArea: ILatlng[] = []

  initAreas() {
    this.deployableArea = {}
    this.movableArea = {}
    this.interactiveArea = []
  }

  getCellType(latLng: ILatlng): CellType {
    if (Object.keys(this.movableArea).length > 0) {
      return this.isMovableArea(latLng) ? 'move' : null
    } else if (this.interactiveArea.length > 0) {
      return this.isInteractiveArea(latLng) ? 'interact' : null
    } else if (Object.keys(this.deployableArea).length > 0) {
      return this.isDeployableArea(latLng) ? 'deploy' : null
    }
    return null
  }

  isDeployableArea(latLng: ILatlng) {
    return this.deployableArea[`${latLng.y}_${latLng.x}`]
  }

  isMovableArea(latLng: ILatlng) {
    return this.movableArea[`${latLng.y}_${latLng.x}`]
  }

  isInteractiveArea(latLng: ILatlng) {
    return this.interactiveArea.some(
      (cell) => cell.x === latLng.x && cell.y === latLng.y
    )
  }

  fillDeployableArea = (deployableAreas: IDeployableArea[]): void => {
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
    this.deployableArea = filledDeployableArea
  }

  fillMovableArea = (latLng: ILatlng, movePoint: number): void => {
    const movableRange: { [key: string]: Boolean } = {}
    for (let i = -movePoint; i <= movePoint; i++) {
      const upperY = movePoint - Math.abs(i)
      const lowerY = -movePoint + Math.abs(i)
      for (let j = lowerY + 1; j < upperY; j++) {
        movableRange[`${latLng.y + j}_${latLng.x + i}`] = true
      }
    }
    this.movableArea = movableRange
  }

  fillInteractiveArea = (latLng: ILatlng, weaponType: WeaponType): void => {
    const fillArea = (num: number): ILatlng[] => [
      { x: latLng.x, y: latLng.y + num },
      { x: latLng.x + num, y: latLng.y },
      { x: latLng.x - num, y: latLng.y },
      { x: latLng.x, y: latLng.y - num }
    ]

    switch (weaponType) {
      case 'closeRange':
        this.interactiveArea = fillArea(1)
        break
      case 'projectile':
        this.interactiveArea = fillArea(2)
        break
      case 'other':
        this.interactiveArea = []
        break
    }
  }
}
