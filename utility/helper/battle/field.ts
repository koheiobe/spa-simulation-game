import {
  IDeployableArea,
  ILatlng,
  WeaponType,
  IField,
  SkillType
} from '~/types/battle'
import fieldJson from '~/assets/field.json'
import { ICharacter } from '~/types/store'

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
  character: ICharacter
): { [key: string]: Boolean } => {
  const { moveDistance, skill } = character
  const movableArea: { [key: string]: Boolean } = {}
  movableArea[`${latLng.y}_${latLng.x}`] = true
  computeMovableCell(latLng, moveDistance, movableArea, { x: 1, y: 0 }, skill)
  computeMovableCell(latLng, moveDistance, movableArea, { x: -1, y: 0 }, skill)
  computeMovableCell(latLng, moveDistance, movableArea, { x: 0, y: 1 }, skill)
  computeMovableCell(latLng, moveDistance, movableArea, { x: 0, y: -1 }, skill)

  return movableArea
}

const computeMovableCell = (
  latLng: ILatlng,
  moveDistance: number,
  movableArea: { [key: string]: Boolean },
  direction: ILatlng,
  skill: Array<SkillType>
) => {
  const updatedLatLng = {
    x: latLng.x + direction.x,
    y: latLng.y + direction.y
  }
  const field: IField = fieldJson
  let updatedMovepoint = moveDistance
  const cell = field[`${updatedLatLng.y}_${updatedLatLng.x}`]
  if (cell) {
    switch (cell.type) {
      case 'mountain':
        if (skill.includes('fly')) {
          updatedMovepoint = moveDistance - 1
        } else {
          return
        }
        break
      default:
        updatedMovepoint = moveDistance - 1
    }
  } else {
    updatedMovepoint = moveDistance - 1
  }

  movableArea[`${updatedLatLng.y}_${updatedLatLng.x}`] = true
  if (updatedMovepoint === 0) return

  if (direction.x !== 1)
    computeMovableCell(
      updatedLatLng,
      updatedMovepoint,
      movableArea,
      {
        x: -1,
        y: 0
      },
      skill
    )
  if (direction.x !== -1)
    computeMovableCell(
      updatedLatLng,
      updatedMovepoint,
      movableArea,
      {
        x: 1,
        y: 0
      },
      skill
    )
  if (direction.y !== 1)
    computeMovableCell(
      updatedLatLng,
      updatedMovepoint,
      movableArea,
      {
        x: 0,
        y: -1
      },
      skill
    )
  if (direction.y !== -1)
    computeMovableCell(
      updatedLatLng,
      updatedMovepoint,
      movableArea,
      {
        x: 0,
        y: 1
      },
      skill
    )
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
