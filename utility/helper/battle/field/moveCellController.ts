import { ILatlng, IMovableArea, IField, SkillType } from '~/types/battle'
import { ICharacter } from '~/types/store'
import fieldJson from '~/assets/field.json'

export default class CharacterMoveController {
  private movableArea: IMovableArea = {}

  startMoveMode(
    latLng: ILatlng,
    character: ICharacter,
    charactersLatLngMap: IField
  ) {
    this.movableArea = this.fillMovableArea(
      latLng,
      character,
      charactersLatLngMap
    )
  }

  finishMoveMode() {
    this.movableArea = {}
  }

  isMoving() {
    return Object.keys(this.movableArea).length > 0
  }

  isMovable(latLng: ILatlng) {
    return this.movableArea[`${latLng.y}_${latLng.x}`] > 0
  }

  /**
   * @param latLng クリックされたキャラクターの座標(x, y)
   * @param character クリックされたキャラクター
   * @param charactersLatLngMap フィールドに存在する全キャラクターの座標オブジェクト
   */
  private fillMovableArea(
    latLng: ILatlng,
    character: ICharacter,
    charactersLatLngMap: IField
  ): IMovableArea {
    const { moveDistance, skill } = character
    const movableArea: IMovableArea = {}
    movableArea[`${latLng.y}_${latLng.x}`] = moveDistance
    const field: IField = fieldJson
    const mergedField = Object.assign({}, field, charactersLatLngMap)
    this.computeMovableCell(
      latLng,
      moveDistance,
      movableArea,
      { x: 1, y: 0 },
      skill,
      mergedField
    )
    this.computeMovableCell(
      latLng,
      moveDistance,
      movableArea,
      { x: -1, y: 0 },
      skill,
      mergedField
    )
    this.computeMovableCell(
      latLng,
      moveDistance,
      movableArea,
      { x: 0, y: 1 },
      skill,
      mergedField
    )
    this.computeMovableCell(
      latLng,
      moveDistance,
      movableArea,
      { x: 0, y: -1 },
      skill,
      mergedField
    )

    return movableArea
  }

  private computeMovableCell(
    latLng: ILatlng,
    moveDistance: number,
    movableArea: IMovableArea,
    direction: ILatlng,
    skill: Array<SkillType>,
    mergedField: IField
  ) {
    const updatedLatLng = {
      x: latLng.x + direction.x,
      y: latLng.y + direction.y
    }

    let updatedMovepoint = moveDistance
    const cell = mergedField[`${updatedLatLng.y}_${updatedLatLng.x}`]
    if (cell) {
      switch (cell.type) {
        case 'mountain':
        case 'character':
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
    const lastCheckedMovePoint =
      movableArea[`${updatedLatLng.y}_${updatedLatLng.x}`]
    if (lastCheckedMovePoint && lastCheckedMovePoint > updatedMovepoint) return
    movableArea[`${updatedLatLng.y}_${updatedLatLng.x}`] = updatedMovepoint
    if (updatedMovepoint === 0) return

    if (direction.x !== 1)
      this.computeMovableCell(
        updatedLatLng,
        updatedMovepoint,
        movableArea,
        {
          x: -1,
          y: 0
        },
        skill,
        mergedField
      )
    if (direction.x !== -1)
      this.computeMovableCell(
        updatedLatLng,
        updatedMovepoint,
        movableArea,
        {
          x: 1,
          y: 0
        },
        skill,
        mergedField
      )
    if (direction.y !== 1)
      this.computeMovableCell(
        updatedLatLng,
        updatedMovepoint,
        movableArea,
        {
          x: 0,
          y: -1
        },
        skill,
        mergedField
      )
    if (direction.y !== -1)
      this.computeMovableCell(
        updatedLatLng,
        updatedMovepoint,
        movableArea,
        {
          x: 0,
          y: 1
        },
        skill,
        mergedField
      )
  }
}
