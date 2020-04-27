import { IDeployableArea, ILatlng, WeaponType } from '~/types/battle'
import field from '~/constants/field'
import fieldType from '~/constants/fieldType'

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
  const movableArea: { [key: string]: Boolean } = {}
  movableArea[`${latLng.y}_${latLng.x}`] = true
  // const latLng1 = { x: latLng.x + 1, y: latLng.y }
  // const latLng2 = { x: latLng.x - 1, y: latLng.y }
  // const latLng3 = { x: latLng.x, y: latLng.y + 1 }
  // const latLng4 = { x: latLng.x, y: latLng.y - 1 }
  computeMovableCell(latLng, movePoint, movableArea, { x: 1, y: 0 })
  computeMovableCell(latLng, movePoint, movableArea, { x: -1, y: 0 })
  computeMovableCell(latLng, movePoint, movableArea, { x: 0, y: 1 })
  computeMovableCell(latLng, movePoint, movableArea, { x: 0, y: -1 })

  return movableArea
}

const computeMovableCell = (
  latLng: ILatlng,
  movePoint: number,
  movableArea: { [key: string]: Boolean },
  direction: ILatlng
) => {
  const updatedLatLng = {
    x: latLng.x + direction.x,
    y: latLng.y + direction.y
  }
  let updatedMovepoint = movePoint
  const cell = field[`${updatedLatLng.y}_${updatedLatLng.x}`]
  if (cell) {
    switch (cell.type) {
      case 'mountain':
        return
      default:
        updatedMovepoint = movePoint - 1
    }
  } else {
    updatedMovepoint = movePoint - 1
  }

  movableArea[`${updatedLatLng.y}_${updatedLatLng.x}`] = true
  if (updatedMovepoint === 0) return

  if (direction.x !== 1)
    computeMovableCell(updatedLatLng, updatedMovepoint, movableArea, {
      x: -1,
      y: 0
    })
  if (direction.x !== -1)
    computeMovableCell(updatedLatLng, updatedMovepoint, movableArea, {
      x: 1,
      y: 0
    })
  if (direction.y !== 1)
    computeMovableCell(updatedLatLng, updatedMovepoint, movableArea, {
      x: 0,
      y: -1
    })
  if (direction.y !== -1)
    computeMovableCell(updatedLatLng, updatedMovepoint, movableArea, {
      x: 0,
      y: 1
    })
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
