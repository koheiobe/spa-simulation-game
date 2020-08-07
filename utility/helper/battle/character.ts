import { Vue } from 'vue-property-decorator'
import { ICharacter } from '~/types/store'
import { ILatlng } from '~/types/battle'

export default class CharacterController extends Vue {
  private activeCharacter?: ICharacter
  private isHostOrGuest: 'host' | 'guest'

  constructor(isHostOrGuest: 'host' | 'guest') {
    super()
    this.isHostOrGuest = isHostOrGuest
  }

  setActiveCharacter(character: ICharacter) {
    this.activeCharacter = character
  }

  updateActiveCharacter(param: any) {
    this.activeCharacter = { ...this.activeCharacter, ...param }
  }

  isActiveCharacterExist() {
    return Boolean(this.activeCharacter)
  }

  moveCharacter(latLng: ILatlng, cellCharacterId: string, isMyTurn: boolean) {
    if (!this.activeCharacter) return false
    const isMovableCell =
      this.activeCharacter.id === cellCharacterId ||
      cellCharacterId.length === 0
    if (
      isMovableCell &&
      isMyTurn &&
      this.isMyCharacter(this.activeCharacter) &&
      this.activeCharacter.actionState.isEnd === false
    ) {
      this.updateActiveCharacter({
        latLng,
        lastLatLng: this.activeCharacter.latLng
      })
      return true
    }
    return false
  }

  isMyCharacter(character: ICharacter | undefined) {
    if (!character) return false
    const matchedSuffix = character.id.match(/-.+()$/)
    if (!matchedSuffix) return false
    return matchedSuffix[0].replace('-', '') === this.isHostOrGuest
  }
}
