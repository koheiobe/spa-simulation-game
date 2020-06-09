<template>
  <div :class="$style.container">
    <div :class="$style.timerContainer">
      <span :class="[isNearlyTimeOut ? $style.nearlyTimeOut : '']">{{
        time
      }}</span>
      /
      {{ TIME_LIMIT }}
    </div>
    <div>
      <b-button v-if="isMyTurn" variant="success">あなたのターンです</b-button>
      <b-button v-else>あいてのターンです</b-button>
    </div>
    <div>
      <b-button variant="primary" :disabled="!isMyTurn" @click="onTurnEnd">
        ターン終了
      </b-button>
    </div>
    <!-- 開発用 -->
    <!-- <div>
      <b-button variant="primary" @click="onTurnEnd">
        ターン交代(開発)
      </b-button>
    </div> -->
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { BIconGearFill } from 'bootstrap-vue'
import { Vue, Prop, Watch } from 'vue-property-decorator'
import Option from '../ModalContent/Option.vue'
import { IBattleRoomRes, IUser } from '~/types/store'
import Modal from '~/components/utility/Modal.vue'

const NEARLY_TIME_OUT = 35

@Component({
  components: {
    BIconGearFill,
    Modal,
    Option
  }
})
export default class BattleHeader extends Vue {
  @Prop({ default: undefined })
  battleRoom!: IBattleRoomRes

  @Prop({ default: undefined })
  storeUser?: IUser

  @Prop({ default: false })
  isMyTurn!: boolean

  @Prop({ default: '' })
  turnUid!: string

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

  public timer: number = 0
  public isNearlyTimeOut: boolean = false
  public TIME_LIMIT = 45

  destroyed() {
    if (this.lastIntervalId) {
      clearInterval(this.lastIntervalId)
    }
  }

  @Watch('turnUid', {
    immediate: true
  })
  onChangeTurn() {
    if (!this.storeUser) return
    if (this.lastIntervalId) {
      clearInterval(this.lastIntervalId)
    }
    if (this.storeUser.uid === this.battleRoom.turn.uid) {
      this.setMyTimer(this.battleRoom)
    } else {
      this.setOpponentTimer(this.battleRoom, this.storeUser)
    }
  }

  setMyTimer(battleRoom: IBattleRoomRes) {
    this.timer = Math.round(
      (new Date().getTime() - battleRoom.turn.updatedAt.toDate().getTime()) /
        1000
    )
    this.lastIntervalId = setInterval(() => {
      if (this.timer >= this.TIME_LIMIT) {
        this.timer = 0
        this.isNearlyTimeOut = false
        this.$emit('turnEnd')
      } else if (this.timer >= NEARLY_TIME_OUT) {
        this.isNearlyTimeOut = true
        this.timer += 1
      } else {
        this.timer += 1
      }
    }, 1000)
  }

  // 50秒たっても相手から反応がない場合オフラインとみなし、３回目で勝利となる
  setOpponentTimer(battleRoom: IBattleRoomRes, user: IUser) {
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
    }, 50000)
  }

  onTurnEnd() {
    this.timer = 0
    this.$emit('turnEnd')
  }

  get time() {
    return this.timer > this.TIME_LIMIT ? 0 : this.timer
  }
}
</script>

<style lang="scss" module>
.container {
  display: flex;
  .timerContainer {
    background-color: white;
    display: flex;
    align-items: center;
  }

  div:not(:first-child) {
    margin-left: 8px;
  }

  .nearlyTimeOut {
    color: red;
  }
}
</style>
