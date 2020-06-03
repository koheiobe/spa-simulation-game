<template>
  <div :class="$style.container">
    <Header
      :class="$style.header"
      :store-user="storeUser"
      :time-limit="TIME_LIMIT"
      :nearly-time-out="NEARLY_TIME_OUT"
      :battle-room="battleRoom"
      :is-my-turn="isMyTurn"
      :turn-uid="turnUid"
      :set-opponent-offline-times="setOpponentOfflineTimes"
      :set-battle-room-winner="setBattleRoomWinner"
      @surrender="onSurrender"
      @turnEnd="onTurnEnd"
      @opponentOfflineThreeTimes="setBattleRoomWinner"
    />
    <Field
      :deployable-area="deployableArea"
      :is-deploy-mode-end="isDeployModeEnd"
      :is-my-turn="isMyTurn"
      :field="field"
      :is-host-or-guest="isHostOrGuest"
      :sync-vuex-firestore-characters="syncVuexFirestoreCharacters"
      :last-interact-character="lastInteractCharacter"
      @setLastInteractCharacter="setLastInteractCharacter"
    />
    <!-- 開発用 -->
    <b-button @click="toggleDeployMode"
      >deployモード: {{ isDeployModeEnd ? 'オフ' : 'オン' }}</b-button
    >
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
import { IDeployableArea, ActionType } from '~/types/battle'
import Modal from '~/components/utility/Modal.vue'
import EndBattleDialogue from '~/components/battle/ModalContent/EndBattleDialogue.vue'
import Header from '~/components/battle/Header.vue'
import field from '~/assets/field.json'
import { fillDeployableArea } from '~/utility/helper/battle/field'

const UserModule = namespace('user')
const BattleRoomModule = namespace('battleRoom')
const CharacterModule = namespace('character')

@Component({
  components: { Field, Modal, EndBattleDialogue, Header },
  layout: 'battle'
})
export default class OnlineBattleRoom extends Vue {
  @UserModule.Getter('getUser') private storeUser!: IUser

  @CharacterModule.State('characters')
  private storeCharacters!: ICharacter[]

  @CharacterModule.Action('updateCharacters')
  private updateCharacters!: (dbInfo: {
    battleId: string
    characters: ICharacter[]
  }) => Promise<null>

  @CharacterModule.Action('bindCharactersRef')
  private bindCharactersRef!: (
    characterRef: firebase.firestore.CollectionReference<
      firebase.firestore.DocumentData
    >
  ) => Promise<null>

  @BattleRoomModule.State('battleRoom')
  private battleRoom!: IBattleRoomRes

  @BattleRoomModule.Getter('isHostOrGuest')
  public isHostOrGuest!: 'host' | 'guest' | ''

  @BattleRoomModule.Getter('isDeployModeEnd')
  public isDeployModeEnd!: boolean

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

  @BattleRoomModule.Action('setDeployModeEnd')
  public setDeployModeEnd!: (battleRoomInfo: {
    id: string
    hostOrGuest: 'host' | 'guest'
    bool: boolean
  }) => void

  @BattleRoomModule.Action('setLastInteractCharacter')
  private setLastInteractCharacter!: (battleRoomInfo: {
    id: string
    lastInteractCharacter: ICharacter | null
  }) => {}

  private TIME_LIMIT = 45
  private NEARLY_TIME_OUT = 35

  // TODO: フィールドによって可変
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
  public deployableArea: { [key: string]: Boolean } = {}
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
    if (!this.isDeployModeEnd) {
      // TODO: キャラクターの登録方法は戦闘開始前に行う予定だが、詳細は未定
      this.initCharacters()
      this.startDeployMode()
      // TODO: どっちが先行なのか、どうやって決めるかは未定
      const turnNumber = this.battleRoom.turn.number
      this.setTurnInfo({
        id: this.storeUser.battleId,
        uid: this.storeUser.uid,
        turnNumber: turnNumber === 0 ? 1 : turnNumber
      })
    } else {
      this.syncVuexFirestoreCharacters(this.battleRoom.id)
    }

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
    this.updateCharacters({
      battleId: this.storeUser.battleId,
      characters
    })
    this.syncVuexFirestoreCharacters(this.storeUser.battleId)
  }

  syncVuexFirestoreCharacters(battleId: string) {
    const dbCharactersRef = this.$firestore.getCharactersRef(battleId)
    this.bindCharactersRef(dbCharactersRef)
  }

  startDeployMode() {
    this.deployableArea = fillDeployableArea(this.deployableAreas)
    // 開発用
    if (this.isHostOrGuest !== '') {
      this.setDeployModeEnd({
        id: this.battleRoom.id,
        hostOrGuest: this.isHostOrGuest,
        bool: false
      })
    }
  }

  async finishDeployMode() {
    if (
      Object.keys(this.deployableArea).length === 0 ||
      !this.storeUser.battleId
    )
      return
    this.deployableArea = {}

    await this.updateCharacters({
      battleId: this.storeUser.battleId,
      characters: this.storeCharacters
    })
    // Field.vueのdeployCharacterのthis.setCharacterParamをすると
    // vuexとfirestoreの参照が外れるため再度、同期させる必要がある
    this.syncVuexFirestoreCharacters(this.storeUser.battleId)
    if (this.isHostOrGuest !== '') {
      this.setDeployModeEnd({
        id: this.storeUser.battleId,
        hostOrGuest: this.isHostOrGuest,
        bool: true
      })
    }
  }

  onTurnStart() {
    const initActionStatesCharacter = this.storeCharacters.map((character) => ({
      ...character,
      actionState: {
        ...character.actionState,
        name: '' as ActionType,
        isEnd: false
      }
    }))
    this.updateCharacters({
      battleId: this.battleRoom.id,
      characters: initActionStatesCharacter
    })
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

  @Watch('turnUid')
  onChangeTurn(turnUid: string) {
    if (turnUid === '' || !this.isMyTurn) return

    this.onTurnStart()
  }

  // 開発用
  toggleDeployMode() {
    if (this.isDeployModeEnd) {
      this.startDeployMode()
    } else {
      this.finishDeployMode()
    }
  }

  get isMyTurn() {
    return this.battleRoom && this.battleRoom.turn.uid === this.storeUser.uid
  }

  get winnerUid() {
    if (!this.battleRoom) return ''
    return this.battleRoom.winnerUid
  }

  // TODO: Header側のturn機能をこのファイルに移植する
  get turnUid() {
    return this.battleRoom ? this.battleRoom.turn.uid : ''
  }

  get lastInteractCharacter() {
    return this.battleRoom ? this.battleRoom.lastInteractCharacter : null
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
