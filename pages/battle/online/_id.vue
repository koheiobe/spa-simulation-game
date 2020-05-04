<template>
  <div :class="$style.container">
    <Header
      :class="$style.header"
      :store-user="storeUser"
      :time-limit="TIME_LIMIT"
      :nearly-time-out="NEARLY_TIME_OUT"
      :battle-room="battleRoom"
      :set-opponent-offline-times="setOpponentOfflineTimes"
      :set-battle-room-winner="setBattleRoomWinner"
      @surrender="onSurrender"
      @turnEnd="onTurnEnd"
      @opponentOfflineThreeTimes="setBattleRoomWinner"
    />
    <Field :deployable-areas="deployableAreas" />
    <Modal :is-open="isBattleFinishModalOpen">
      <EndBattleDialogue :winner-name="winnerName" />
    </Modal>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import CharacterList from '~/constants/characters'
import Field from '~/components/battle/Field.vue'
import { IUser, ICharacter, IBattleRoom } from '~/types/store'
import { IDeployableArea } from '~/types/battle'
import Modal from '~/components/utility/Modal.vue'
import EndBattleDialogue from '~/components/battle/ModalContent/endBattleDialogue.vue'
import Header from '~/components/battle/Header.vue'
const ItemUserModule = namespace('user')
const ItemBattleRoomsModule = namespace('battleRooms')
const ItemBattleModule = namespace('battle')

@Component({
  components: { Field, Modal, EndBattleDialogue, Header },
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

  @ItemBattleRoomsModule.Action('setTurnUid')
  private setTurnUid!: (battleRoomInfo: { id: string; uid: string }) => void

  @ItemBattleRoomsModule.Action('setOpponentOfflineTimes')
  public setOpponentOfflineTimes!: (battleRoomInfo: {
    id: string
    hostOrGuest: 'host' | 'guest'
    offlineTimes: number
  }) => void

  private TIME_LIMIT = 45
  private NEARLY_TIME_OUT = 35

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
    // TODO: キャラクターの登録方法は戦闘開始前に行う予定だが、詳細は未定
    this.initCharacters()
    // TODO: どっちが先行なのか、どうやって決めるかは未定
    this.setTurnUid({ id: this.storeUser.battleId, uid: this.storeUser.uid })
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

  onTurnEnd() {
    if (!this.storeUser.battleId) return
    const nextTurnUid =
      this.battleRoom.turn.uid === this.battleRoom.host.uid
        ? this.battleRoom.guest.uid
        : this.battleRoom.host.uid

    this.setTurnUid({ id: this.storeUser.battleId, uid: nextTurnUid })
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

  onDecideWinner() {
    if (this.isBattleFinishModalOpen) return
    this.winnerName =
      this.battleRoom.host.uid === this.battleRoom.winnerUid
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

  @Watch('winnerUid')
  onChangeWinnerUid() {
    this.onDecideWinner()
  }

  get winnerUid() {
    if (!this.battleRoom) return ''
    return this.battleRoom.winnerUid
  }
}
</script>

<style lang="scss" module>
.container {
  position: relative;

  .header {
    position: fixed;
    right: 0;
    top: 0;
  }
}
</style>
