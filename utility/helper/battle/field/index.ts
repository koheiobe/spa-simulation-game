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

export const hostWinCell = { x: 5, y: 25 }
export const guestWinCell = { x: 28, y: 3 }

export const hostDeployableAreas: IDeployableArea[] = [
  {
    upperLeft: {
      x: 25,
      y: 0
    },
    upperRight: {
      x: 30,
      y: 0
    },
    lowerLeft: {
      x: 25,
      y: 5
    },
    lowerRight: {
      x: 30,
      y: 5
    }
  },
  {
    upperLeft: {
      x: 24,
      y: 23
    },
    upperRight: {
      x: 27,
      y: 23
    },
    lowerLeft: {
      x: 24,
      y: 26
    },
    lowerRight: {
      x: 27,
      y: 26
    }
  }
]

export const guestDeployableAreas: IDeployableArea[] = [
  {
    upperLeft: {
      x: 2,
      y: 24
    },
    upperRight: {
      x: 7,
      y: 24
    },
    lowerLeft: {
      x: 2,
      y: 29
    },
    lowerRight: {
      x: 7,
      y: 29
    }
  },
  {
    upperLeft: {
      x: 2,
      y: 1
    },
    upperRight: {
      x: 6,
      y: 1
    },
    lowerLeft: {
      x: 2,
      y: 3
    },
    lowerRight: {
      x: 6,
      y: 3
    }
  }
]
