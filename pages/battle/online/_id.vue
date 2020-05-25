<template>
  <div :class="$style.container">
    <Header
      :class="$style.header"
      :store-user="storeUser"
      :time-limit="TIME_LIMIT"
      :nearly-time-out="NEARLY_TIME_OUT"
      :battle-room="battleRoom"
      :is-my-turn="isMyTurn"
      :set-opponent-offline-times="setOpponentOfflineTimes"
      :set-battle-room-winner="setBattleRoomWinner"
      @surrender="onSurrender"
      @turnEnd="onTurnEnd"
      @opponentOfflineThreeTimes="setBattleRoomWinner"
    />
    <Field
      :deployable-areas="deployableAreas"
      :is-my-turn="isMyTurn"
      :field="field"
      :is-host-or-guest="isHostOrGuest"
      :sync-vuex-firestore-characters="syncVuexFirestoreCharacters"
    />
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
import { IUser, ICharacter, IBattleRoomRes } from '~/types/store'
import { IDeployableArea } from '~/types/battle'
import Modal from '~/components/utility/Modal.vue'
import EndBattleDialogue from '~/components/battle/ModalContent/EndBattleDialogue.vue'
import Header from '~/components/battle/Header.vue'
import field from '~/assets/field.json'

const UserModule = namespace('user')
const BattleRoomModule = namespace('battleRoom')
const BattleModule = namespace('battle')

@Component({
  components: { Field, Modal, EndBattleDialogue, Header },
  layout: 'battle'
})
export default class OnlineBattleRoom extends Vue {
  @UserModule.Getter('getUser') private storeUser!: IUser
  @BattleRoomModule.State('battleRoom')
  private battleRoom!: IBattleRoomRes

  @BattleModule.Action('updateCharacters')
  private updateCharacters!: (dbInfo: {
    battleId: string
    characters: ICharacter[]
  }) => Promise<null>

  @BattleModule.Action('bindCharactersRef')
  private bindCharactersRef!: (
    characterRef: firebase.firestore.CollectionReference<
      firebase.firestore.DocumentData
    >
  ) => Promise<null>

  @BattleRoomModule.Action('bindBattleRoomRef')
  private bindBattleRoomRef!: (ref: any) => void

  @BattleRoomModule.Action('deleteBattleRoom')
  private deleteBattleRoom!: (battleId: string) => Promise<null>

  @BattleRoomModule.Action('setUserBattleId')
  private setUserBattleId!: (userInfo: {
    uid: string
    battleId: string
  }) => Promise<null>

  @BattleRoomModule.Action('setBattleRoomWinner')
  private setBattleRoomWinner!: (battleRoomInfo: {
    id: string
    winnerUid: string
  }) => void

  @BattleRoomModule.Action('deleteUserBattleId')
  private deleteUserBattleId!: (uid: string) => void

  @BattleRoomModule.Action('setTurnInfo')
  private setTurnInfo!: (battleRoomInfo: {
    id: string
    uid: string
    turnNumber: number
  }) => void

  @BattleRoomModule.Action('setOpponentOfflineTimes')
  public setOpponentOfflineTimes!: (battleRoomInfo: {
    id: string
    hostOrGuest: 'host' | 'guest'
    offlineTimes: number
  }) => void

  @BattleRoomModule.Getter('isHostOrGuest')
  public isHostOrGuest!: 'host' | 'guest' | ''

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
  // TODO: プレイヤーが変更 or ランダムで選択できるようにする
  public field = field

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
    const turnNumber = this.battleRoom.turn.number
    this.setTurnInfo({
      id: this.storeUser.battleId,
      uid: this.storeUser.uid,
      turnNumber: turnNumber === 0 ? 1 : turnNumber
    })
    // ウィンドウを閉じる時に注意を表示
    window.addEventListener('beforeunload', function(e) {
      e.preventDefault()
    })
    this.preventHistoryBack()
  }

  initCharacters() {
    if (!this.storeUser.battleId) return

    const characterList = CharacterList as any
    const characters = [] as ICharacter[]
    const hostOrGuest = this.isHostOrGuest
    Object.keys(characterList).forEach((key) => {
      characters.push({
        ...characterList[key],
        id: characterList[key].id + '-' + hostOrGuest
      })
    })
    this.syncVuexFirestoreCharacters(characters, this.storeUser.battleId)
  }

  syncVuexFirestoreCharacters(characters: ICharacter[], battleId: string) {
    const dbCharactersRef = this.$firestore.getCharactersRef(battleId)

    this.updateCharacters({
      battleId,
      characters
    })
    this.bindCharactersRef(dbCharactersRef)
  }

  onTurnEnd() {
    if (!this.storeUser.battleId) return
    const nextTurnUid =
      this.battleRoom.turn.uid === this.battleRoom.host.uid
        ? this.battleRoom.guest.uid
        : this.battleRoom.host.uid
    const nextTurnNumber = this.battleRoom.turn.number + 1
    this.setTurnInfo({
      id: this.storeUser.battleId,
      uid: nextTurnUid,
      turnNumber: nextTurnNumber
    })
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
    this.isBattleFinishModalOpen = true
    this.winnerName =
      this.battleRoom.host.uid === this.battleRoom.winnerUid
        ? this.battleRoom.host.name
        : this.battleRoom.guest.name
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

  preventHistoryBack() {
    history.pushState(null, '', location.href)
    window.addEventListener('popstate', (_) => {
      history.go(1)
    })
  }

  @Watch('winnerUid')
  onChangeWinnerUid() {
    this.onDecideWinner()
  }

  get isMyTurn() {
    return this.battleRoom && this.battleRoom.turn.uid === this.storeUser.uid
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
