import { WeaponType, ILatlng } from '~/types/battle'

export default class InteractCellController {
  private interactiveArea: ILatlng[] = []

  isInteracting() {
    return this.interactiveArea.length > 0
  }

  isInteractable(latLng: ILatlng) {
    return this.interactiveArea.some(
      (cell) => cell.x === latLng.x && cell.y === latLng.y
    )
  }

  startIntarctMode(latLng: ILatlng, weaponType: WeaponType) {
    this.interactiveArea = this.fillInteractiveArea(latLng, weaponType)
  }

  finishInteractMode() {
    this.interactiveArea = []
  }

  private fillInteractiveArea(latLng: ILatlng, weaponType: WeaponType) {
    const fillArea = (num: number): ILatlng[] => [
      { x: latLng.x, y: latLng.y + num },
      { x: latLng.x + num, y: latLng.y },
      { x: latLng.x - num, y: latLng.y },
      { x: latLng.x, y: latLng.y - num }
    ]

    switch (weaponType) {
      case 'closeRange':
        return fillArea(1)
      case 'projectile':
        return fillArea(2)
      case 'other':
        return []
    }
  }
}
