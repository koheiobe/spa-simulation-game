import { ActionTree, GetterTree, MutationTree } from 'vuex'
import { CellType, IField, ILatlng, WeaponType } from '~/types/battle'
import { IRootState, IFieldState, ICharacter } from '~/types/store'
import { FieldController } from '~/utility/helper/battle/field'
import * as firstStage from '~/assets/field/firstStage'

export const state = (): IFieldState => ({
  fieldController: undefined
})

export const getters: GetterTree<IFieldState, IRootState> = {
  fieldController: (state) => (): FieldController | undefined => {
    return state.fieldController
  },
  modeType: (_, getters) => (latLng: ILatlng): CellType | '' => {
    return getters.fieldController()
      ? getters.fieldController().getModeType(latLng)
      : ''
  },
  winnerCell: (_, getters) => (isHostOrGuest: string): ILatlng => {
    return getters.fieldController()
      ? getters.fieldController().getWinnerCell(isHostOrGuest)
      : { x: -1, y: -1 }
  },
  isDeploying: (_, getters): boolean => {
    return getters.fieldController()
      ? getters.fieldController().isDeploying()
      : false
  }
}

export const actions: ActionTree<IFieldState, IRootState> = {
  setFieldController({ commit }, stageId: number) {
    if (stageId === 1) {
      const fieldController = new FieldController({
        hostWinCell: firstStage.hostWinCell,
        guestWinCell: firstStage.guestWinCell,
        hostDeployableAreas: firstStage.hostDeployableAreas,
        guestDeployableAreas: firstStage.guestDeployableAreas
      })
      commit('setFieldController', fieldController)
    } else {
      console.error('no matched field ID ')
    }
  }
}

const errorSentence = 'fieldController is not set'
export const mutations: MutationTree<IFieldState> = {
  setFieldController(state, fieldController: FieldController) {
    state.fieldController = fieldController
  },
  startMoveMode(
    state,
    obj: {
      latLng: ILatlng
      character: ICharacter
      charactersLatLngMap: IField
    }
  ) {
    if (!state.fieldController) {
      console.error(errorSentence)
      return
    }
    if (obj.latLng.x < 0 || obj.latLng.y < 0) return
    state.fieldController.startMoveMode(
      obj.latLng,
      obj.character,
      obj.charactersLatLngMap
    )
  },
  finishMoveMode(state) {
    if (!state.fieldController) {
      console.error(errorSentence)
      return
    }
    state.fieldController.finishMoveMode()
  },
  startInteractMode(state, obj: { latLng: ILatlng; weaponType: WeaponType }) {
    if (!state.fieldController) {
      console.error(errorSentence)
      return
    }
    if (obj.latLng.x < 0 || obj.latLng.y < 0) return
    state.fieldController.startInteractMode(obj.latLng, obj.weaponType)
  },
  finishInteractMode(state) {
    if (!state.fieldController) {
      console.error(errorSentence)
      return
    }
    state.fieldController.finishInteractMode()
  },
  startDeployMode(state, isHostOrGuest) {
    if (!state.fieldController) {
      console.error(errorSentence)
      return
    }
    state.fieldController.startDeployMode(isHostOrGuest)
  },
  finishDeployMode(state) {
    if (!state.fieldController) {
      console.error(errorSentence)
      return
    }
    state.fieldController.finishDeployMode()
  }
}
