<template>
  <div :class="$style.container">
    <Header
      :class="$style.header"
      :store-user="storeUser"
      :battle-room="battleRoom"
      :is-my-turn="isMyTurn"
      :turn-uid="turnUid"
      :turn-number="turnNumber"
      :set-opponent-offline-times="setOpponentOfflineTimes"
      :set-battle-room-winner="setBattleRoomWinner"
      :is-deploy-mode-end="isDeployModeEnd"
      :is-host-or-guest="isHostOrGuest"
      :set-battle-start-at="setBattleStartAt"
      @surrender="onSurrender"
      @deploy-end="finishDeployMode"
      @turn-end="onTurnEnd"
      @opponentOfflineThreeTimes="setBattleRoomWinner"
    />
    <Field
      :is-my-turn="isMyTurn"
      :is-my-character="isMyCharacter"
      :field="field"
      :is-host-or-guest="isHostOrGuest"
      :last-interact-character="lastInteractCharacter"
      :battle-id="battleId"
      @onWin="onWin"
    />
    <!-- 開発用 -->
    <!-- <b-button @click="toggleDeployMode"
      >deployモード: {{ isDeployModeEnd ? 'オフ' : 'オン' }}</b-button
    >-->
    <Modal :is-open="isBattleFinishModalOpen">
      <EndBattleDialogue :message="winnerMessage" :winner-name="winnerName" />
    </Modal>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import Field from '~/components/battle/Field.vue'
import { IUser, ICharacter, IBattleRoomRes, HostOrGuest } from '~/types/store'
import { ActionType } from '~/types/battle'
import Modal from '~/components/utility/Modal.vue'
import EndBattleDialogue from '~/components/battle/ModalContent/endBattleDialogue.vue'
import Header from '~/components/battle/header/index.vue'
import field from '~/assets/field.json'

const UserModule = namespace('user')
const BattleRoomModule = namespace('battleRoom')
const BattleRoomService = namespace('service/battleRoomService')
const CharacterModule = namespace('service/characterService')
const FieldModule = namespace('field')

@Component({
  components: { Field, Modal, EndBattleDialogue, Header },
  layout: 'battle'
})
export default class OnlineBattleRoom extends Vue {
  @UserModule.Getter('getUser') private storeUser!: IUser

  @CharacterModule.Getter('isMyCharacter')
  private isMyCharacter!: (character: ICharacter) => boolean

  @CharacterModule.Getter('isMyTurn')
  private isMyTurn!: () => boolean

  @CharacterModule.Getter('isHostOrGuest')
  private isHostOrGuest!: HostOrGuest | ''

  @BattleRoomService.Getter('winnerName')
  private winnerName!: string

  @BattleRoomService.Getter('winnerUid')
  private winnerUid!: string

  // TODO: Header側のturn機能をこのファイルに移植する
  @BattleRoomService.Getter('turnUid')
  private turnUid!: string

  @BattleRoomService.Getter('lastInteractCharacter')
  private lastInteractCharacter!: ICharacter | undefined

  @BattleRoomService.Getter('isDeployModeEnd')
  private isDeployModeEnd!: boolean

  @BattleRoomService.Getter('isHostAndGuestDeployModeEnd')
  private isHostAndGuestDeployModeEnd!: boolean

  @BattleRoomService.Getter('isBattleRoomUser')
  private isBattleRoomUser!: boolean

  @BattleRoomService.Getter('turnNumber')
  private turnNumber!: boolean

  @BattleRoomService.Action('finishDeployMode')
  private finishDeployMode!: () => void

  @BattleRoomService.Action('changeTurn')
  private changeTurn!: (turnUid: string) => void

  @BattleRoomService.Action('onTurnEnd')
  private onTurnEnd!: () => void

  @BattleRoomService.Action('onWin')
  private onWin!: () => void

  @BattleRoomService.Action('onSurrender')
  private onSurrender!: () => void

  @BattleRoomService.Action('beforeLeaveBattleRoom')
  private beforeLeaveBattleRoom!: () => void

  @BattleRoomService.Action('startBattle')
  private startBattle!: () => void

  @BattleRoomService.Action('toggleDeployMode')
  private toggleDeployMode!: () => void

  @BattleRoomModule.State('battleRoom')
  private battleRoom!: IBattleRoomRes

  @BattleRoomModule.Action('setBattleRoomWinner')
  private _setBattleRoomWinner!: (battleRoomInfo: {
    id: string
    winnerUid: string
  }) => void

  @BattleRoomModule.Action('setOpponentOfflineTimes')
  public setOpponentOfflineTimes!: (battleRoomInfo: {
    id: string
    hostOrGuest: 'host' | 'guest'
    offlineTimes: number
  }) => void

  @BattleRoomModule.Action('setBattleStartAt')
  private setBattleStartAt!: (battleInfo: {
    id: string
    hostOrGuest: 'host' | 'guest'
  }) => {}

  public battleId: string = ''
  public isBattleFinishModalOpen: boolean = false
  // TODO: プレイヤーが変更 or ランダムで選択できるようにする
  public field = field
  public winnerMessage = ''

  async created() {
    this.battleId = this.$route.params.id
    // 対戦者以外は戦闘が見れない
    if (!this.isBattleRoomUser) {
      this.$router.push('/battle/online')
      return
    }

    // ウィンドウを閉じる時に注意を表示
    window.addEventListener('beforeunload', function(e) {
      e.preventDefault()
    })
    this.preventHistoryBack()
  }

  setBattleRoomWinner(battleRoomInfo: {
    id: string
    winnerUid: string
    message?: string
  }) {
    const { message, id, winnerUid } = battleRoomInfo
    this.winnerMessage = message || ''
    this._setBattleRoomWinner({
      id,
      winnerUid
    })
  }

  onDecideWinner() {
    if (this.isBattleFinishModalOpen) return
    this.isBattleFinishModalOpen = true

    // ホストかゲスト、どちらか先に退出してfirestoreのデータを削除すると
    // 残されたクライアント側でエラーが発生するため、同期を中止する
    this.beforeLeaveBattleRoom()
    window.setTimeout(() => this.$router.push('/battle/online'), 5000)
  }

  preventHistoryBack() {
    history.pushState(null, '', location.href)
    window.addEventListener('popstate', (_) => {
      history.go(1)
    })
  }

  @Watch('battleRoom')
  onChangeBattleRoom(battleRoom: IBattleRoomRes) {
    if (this.isHostAndGuestDeployModeEnd) {
      this.startBattle()
    }
  }

  @Watch('winnerUid')
  onChangeWinnerUid() {
    this.onDecideWinner()
  }

  @Watch('turnUid')
  onChangeTurn(turnUid: string) {
    this.changeTurn(turnUid)
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
