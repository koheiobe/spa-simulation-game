<template>
  <div :class="$style.container">
    <div>{{ turnNumber }}ターン目</div>
    <div>
      {{ isMyTurn ? 'あなたのターンです' : '相手のターンです' }}
    </div>
    <div :class="$style.timerContainer">
      <span :class="[isNearlyTimeOut ? $style.nearlyTimeOut : '']">{{
        limitedTimer
      }}</span>
      /
      {{ timeLimit }}
    </div>
    <div>
      <b-button
        variant="primary"
        :disabled="!isMyTurn"
        @click="$emit('turnEnd')"
      >
        ターン終了
      </b-button>
    </div>
    <div>
      <b-button variant="primary" @click="$emit('turnEnd')">
        ターン交代(開発)
      </b-button>
    </div>
    <div>
      <BIconGearFill :class="$style.gearIcon" @click="openOptionModal" />
    </div>
    <Modal :is-open="isOptionModalOpen" @onClickOuter="closeOptionModal">
      <Option @surrender="$emit('surrender')" />
    </Modal>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { BIconGearFill } from 'bootstrap-vue'
import { Vue, Prop } from 'vue-property-decorator'
import { IBattleRoom, IUser } from '../../types/store'
import Option from './ModalContent/Option.vue'
import Modal from '~/components/utility/Modal.vue'

@Component({
  components: {
    BIconGearFill,
    Modal,
    Option
  }
})
export default class BattleHeader extends Vue {
  @Prop({ default: 0 })
  timeLimit!: number

  @Prop({ default: 0 })
  nearlyTimeOut!: number

  @Prop({ default: undefined })
  battleRoom?: IBattleRoom

  @Prop({ default: undefined })
  storeUser?: IUser

  @Prop({ default: false })
  isMyTurn!: boolean

  @Prop({ default: Function })
  setOpponentOfflineTimes!: (battleRoomInfo: {
    id: string
    hostOrGuest: 'host' | 'guest'
    offlineTimes: number
  }) => void

  @Prop({ default: Function })
  setBattleRoomWinner!: (battleRoomInfo: {
    id: string
    winnerUid: string
  }) => void

  private lastIntervalId: NodeJS.Timeout | undefined = undefined

  public isOptionModalOpen: boolean = false
  public timer: number = 0
  public isNearlyTimeOut: boolean = false

  destroyed() {
    if (this.lastIntervalId) {
      clearInterval(this.lastIntervalId)
    }
  }

  // TODO: 開発に邪魔な機能なので、一時的にコメントアウト
  // @Watch('turnUid', {
  //   immediate: true
  // })
  // onChangeTurn() {
  //   if (!this.battleRoom || !this.storeUser) return
  //   if (this.lastIntervalId) {
  //     clearInterval(this.lastIntervalId)
  //   }
  //   if (this.storeUser.uid === this.battleRoom.turn.uid) {
  //     this.setMyTimer(this.battleRoom)
  //   } else {
  //     this.setOpponentTimer(this.battleRoom, this.storeUser)
  //   }
  // }

  setMyTimer(battleRoom: IBattleRoom) {
    this.timer = Math.round(
      (new Date().getTime() - battleRoom.turn.updatedAt.toDate().getTime()) /
        1000
    )
    this.lastIntervalId = setInterval(() => {
      if (this.timer >= this.timeLimit) {
        this.timer = 0
        this.isNearlyTimeOut = false
        this.$emit('turnEnd')
      } else if (this.timer >= this.nearlyTimeOut) {
        this.isNearlyTimeOut = true
        this.timer += 1
      } else {
        this.timer += 1
      }
    }, 1000)
  }

  // 50秒たっても相手から反応がない場合オフラインとみなし、３回目で勝利となる
  setOpponentTimer(battleRoom: IBattleRoom, user: IUser) {
    this.lastIntervalId = setTimeout(() => {
      if (!user.battleId) return
      const hostOrGuest = user.uid === battleRoom.host.uid ? 'host' : 'guest'
      const updatedOfflineTimes =
        battleRoom[hostOrGuest].opponentOfflineTimes + 1
      if (updatedOfflineTimes >= 3) {
        this.setBattleRoomWinner({
          id: user.battleId,
          winnerUid: user.uid
        })
        return
      }
      this.$bvToast.toast(
        `あと${3 - updatedOfflineTimes}ターンで勝利が確定します。`,
        {
          title: '相手がオフラインです',
          variant: 'info',
          autoHideDelay: 1500,
          appendToast: true
        }
      )
      this.setOpponentOfflineTimes({
        id: user.battleId,
        hostOrGuest,
        offlineTimes: updatedOfflineTimes
      })
      this.$emit('turnEnd')
    }, 5000)
  }

  openOptionModal() {
    this.isOptionModalOpen = true
  }

  closeOptionModal() {
    this.isOptionModalOpen = false
  }

  get turnUid() {
    return this.battleRoom ? this.battleRoom.turn.uid : undefined
  }

  get turnNumber() {
    return this.battleRoom ? String(this.battleRoom.turn.number) : ''
  }

  get limitedTimer() {
    return this.timer > this.timeLimit ? 0 : this.timer
  }
}
</script>

<style lang="scss" module>
.container {
  padding: 8px;
  display: flex;

  div:not(:first-child) {
    margin-left: 8px;
  }

  .nearlyTimeOut {
    color: red;
  }

  .gearIcon {
    width: 30px;
    height: 30px;
  }
}
</style>
