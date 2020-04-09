import { IDeployableArea, ILatlng, WeaponType } from '~/types/battle'

export const fillDeployableArea = (
  deployableAreas: IDeployableArea[]
): { [key: string]: Boolean } => {
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

export const fillMovableArea = (
  latLng: ILatlng,
  movePoint: number
): { [key: string]: Boolean } => {
  const movableRange: { [key: string]: Boolean } = {}
  for (let i = -movePoint; i <= movePoint; i++) {
    const upperY = movePoint - Math.abs(i)
    const lowerY = -movePoint + Math.abs(i)
    for (let j = lowerY + 1; j < upperY; j++) {
      movableRange[`${latLng.y + j}_${latLng.x + i}`] = true
    }
  }
  return movableRange
}

export const fillInteractiveArea = (
  latLng: ILatlng,
  weaponType: WeaponType
) => {
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
