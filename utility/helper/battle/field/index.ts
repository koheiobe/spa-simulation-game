import DeployCellController from './deployCellController'
import MoveCellController from './moveCellController'
import InteractCellController from './interactCellController'
import {
  IDeployableArea,
  ILatlng,
  WeaponType,
  IField,
  CellType
} from '~/types/battle'
import { ICharacter } from '~/types/store'

export class FieldController {
  private hostWinCell: ILatlng
  private guestWinCell: ILatlng
  private deployCellController: DeployCellController
  private moveCellController: MoveCellController = new MoveCellController()
  private interactCellController: InteractCellController = new InteractCellController()

  constructor(args: {
    hostWinCell: ILatlng
    guestWinCell: ILatlng
    hostDeployableAreas: IDeployableArea[]
    guestDeployableAreas: IDeployableArea[]
  }) {
    this.hostWinCell = args.hostWinCell
    this.guestWinCell = args.guestWinCell
    this.deployCellController = new DeployCellController(
      args.hostDeployableAreas,
      args.guestDeployableAreas
    )
  }

  startDeployMode(isHostOrGuest: string) {
    this.deployCellController.startDeployMode(isHostOrGuest)
  }

  finishDeployMode() {
    this.deployCellController.finishDeployMode()
  }

  isDeploying() {
    return this.deployCellController.isDeploying()
  }

  isDeployable(latLng: ILatlng) {
    return this.deployCellController.isDeployable(latLng)
  }

  startMoveMode(
    latLng: ILatlng,
    character: ICharacter,
    charactersLatLngMap: IField
  ) {
    this.moveCellController.startMoveMode(
      latLng,
      character,
      charactersLatLngMap
    )
  }

  finishMoveMode() {
    this.moveCellController.finishMoveMode()
  }

  isMovable(latLng: ILatlng) {
    return this.moveCellController.isMovable(latLng)
  }

  isMoving() {
    return this.moveCellController.isMoving()
  }

  startInteractMode(latLng: ILatlng, weaponType: WeaponType) {
    this.interactCellController.startIntarctMode(latLng, weaponType)
  }

  finishInteractMode() {
    this.interactCellController.finishInteractMode()
  }

  isInteractable(latLng: ILatlng) {
    return this.interactCellController.isInteractable(latLng)
  }

  isInteracting() {
    return this.interactCellController.isInteracting()
  }

  getWinnerCell(isHostOrGuest: string) {
    return isHostOrGuest === 'host' ? this.hostWinCell : this.guestWinCell
  }

  getModeType(latLng: ILatlng): CellType | '' {
    if (
      this.deployCellController.isDeploying() &&
      this.deployCellController.isDeployable(latLng)
    ) {
      return 'deploy'
    } else if (
      this.moveCellController.isMoving() &&
      this.moveCellController.isMovable(latLng)
    ) {
      return 'move'
    } else if (
      this.interactCellController.isInteracting() &&
      this.interactCellController.isInteractable(latLng)
    ) {
      return 'interact'
    } else {
      return ''
    }
  }
}
