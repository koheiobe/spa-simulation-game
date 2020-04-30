<template>
  <div>
    <Field :deployable-areas="deployableAreas" @surrender="onSurrender" />
    <Modal :is-open="isBattleFinishModalOpen">
      <EndBattleDialogue :winner-name="winnerName" />
    </Modal>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import CharacterList from '~/constants/characters'
import Field from '~/components/battle/Field.vue'
import { IUser, ICharacter, IBattleRoom } from '~/types/store'
import { IDeployableArea } from '~/types/battle'
import Modal from '~/components/utility/Modal.vue'
import EndBattleDialogue from '~/components/battle/ModalContent/endBattleDialogue.vue'
const ItemUserModule = namespace('user')
const ItemBattleRoomsModule = namespace('battleRooms')
const ItemBattleModule = namespace('battle')

@Component({
  components: { Field, Modal, EndBattleDialogue },
  layout: 'battle'
})
export default class OnlineBattleRoom extends Vue {
  @ItemUserModule.Getter('getUser') private storeUser!: IUser
  @ItemBattleRoomsModule.State('battleRoom')
  private battleRoom!: IBattleRoom

  @ItemBattleModule.Action('updateCharacters')
  private updateCharacters!: (dbInfo: {
    battleId: string
    characters: ICharacter[]
  }) => Promise<null>

  @ItemBattleModule.Action('bindCharactersRef')
  private bindCharactersRef!: (
    characterRef: firebase.firestore.CollectionReference<
      firebase.firestore.DocumentData
    >
  ) => Promise<null>

  @ItemBattleRoomsModule.Action('bindBattleRoomRef')
  private bindBattleRoomRef!: (ref: any) => void

  @ItemBattleRoomsModule.Action('deleteBattleRoom')
  private deleteBattleRoom!: (battleId: string) => Promise<null>

  @ItemBattleRoomsModule.Action('setUserBattleId')
  private setUserBattleId!: (userInfo: {
    uid: string
    battleId: string
  }) => Promise<null>

  @ItemBattleRoomsModule.Action('setBattleRoomWinner')
  private setBattleRoomWinner!: (battleRoomInfo: {
    id: string
    winnerUid: string
  }) => void

  @ItemBattleRoomsModule.Action('deleteUserBattleId')
  private deleteUserBattleId!: (uid: string) => void

  public deployableAreas: IDeployableArea[] = [
    {
      upperLeft: {
        x: 25,
        y: 5
      },
      upperRight: {
        x: 30,
        y: 5
      },
      lowerLeft: {
        x: 25,
        y: 10
      },
      lowerRight: {
        x: 30,
        y: 10
      }
    }
  ]

  public winnerName: string = ''
  public isBattleFinishModalOpen: boolean = false

  async mounted() {
    if (!this.storeUser.battleId) {
      this.$router.push('/battle/online')
      return
    }
    await this.bindBattleRoomRef(
      this.$firestore.getBattleRoomRef(this.storeUser.battleId)
    )
    // 対戦者以外は戦闘が見れない
    if (
      this.storeUser.uid !== this.battleRoom.host.uid &&
      this.storeUser.uid !== this.battleRoom.guest.uid
    ) {
      this.$router.push('/battle/online')
      return
    }
    // TODO キャラクターの登録方法は戦闘開始前に行う予定だが、詳細は未定
    this.initCharacters()
    this.$store.subscribe((_, state) => {
      const battleRoom = state.battleRooms.battleRoom
      if (battleRoom && battleRoom.winnerUid.length > 0) {
        this.onDecideWinner(battleRoom.winnerUid)
      }
    })
  }

  async initCharacters() {
    if (!this.storeUser.battleId) return

    const characterList = CharacterList as any
    const characters = [] as ICharacter[]
    const hostOrGuest: 'host' | 'guest' =
      this.battleRoom.host.uid === this.storeUser.uid ? 'host' : 'guest'
    Object.keys(characterList).forEach((key) => {
      characters.push({
        ...characterList[key],
        id: characterList[key].id + '-' + hostOrGuest
      })
    })
    const dbCharactersRef = this.$firestore.getCharactersRef(
      this.storeUser.battleId
    )

    const dbCharacters = await dbCharactersRef.get()
    if (dbCharacters.empty) {
      this.updateCharacters({
        battleId: this.storeUser.battleId,
        characters
      })
    }
    this.bindCharactersRef(dbCharactersRef)
  }

  onDecideWinner(winnerUid: string) {
    this.winnerName =
      this.battleRoom.host.uid === winnerUid
        ? this.battleRoom.host.name
        : this.battleRoom.guest.name
    this.isBattleFinishModalOpen = true
    window.setTimeout(this.onEndBattle, 5000)
  }

  async onEndBattle() {
    if (!this.storeUser.battleId) return
    await this.deleteBattleRoom(this.storeUser.battleId).catch((e) =>
      // TODO: エラーハンドリングはあとで考える
      console.error('battleRoomの削除に失敗しました。', e)
    )
    this.deleteUserBattleId(this.storeUser.uid)
    this.$router.push('/battle/online')
  }

  onSurrender() {
    if (!this.storeUser.battleId) return

    const opponentUid =
      this.battleRoom.host.uid === this.storeUser.uid
        ? this.battleRoom.guest.uid
        : this.battleRoom.host.uid
    this.setBattleRoomWinner({
      id: this.storeUser.battleId,
      winnerUid: opponentUid
    })
  }
}
</script>

<style lang="scss" module></style>
