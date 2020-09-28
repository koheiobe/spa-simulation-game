<template>
  <div :class="$style.container">
    <div v-show="!isDeployModeEnd" :class="$style.timerContainer">
      <span :class="[isNearlyTimeOut ? $style.nearlyTimeOut : '']">{{
        time
      }}</span>
      /
      {{ TIME_LIMIT }}
    </div>
    <div>
      <b-button variant="primary" @click="$emit('deploy-end')">
        デプロイ終了
      </b-button>
    </div>
    <Modal :is-open="isOpen" @onClickOuter="tryCloseModal"
      ><p>
        {{
          isDeployModeEnd
            ? '対戦相手がキャラクターを配置中です...'
            : 'キャラクターを配置してください。'
        }}
      </p></Modal
    >
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue, Prop, Watch } from 'vue-property-decorator'
import { IBattleRoomRes, IUser } from '~/types/store'
import Modal from '~/components/utility/Modal.vue'

const NEARLY_TIME_OUT = 170
// 70秒以上経過しても相手からレスポンスがない場合、無条件で勝利とする
const OPPONENT_OFFLINE_TIME = 190

@Component({
  components: {
    Modal
  }
})
export default class DeployHeader extends Vue {
  @Prop({ default: undefined })
  storeUser!: IUser

  @Prop({ default: false })
  isDeployModeEnd!: boolean

  @Prop({ default: undefined })
  battleRoom!: IBattleRoomRes

  @Prop({ default: '' })
  isHostOrGuest!: 'host' | 'guest'

  @Prop({ default: Function })
  setBattleRoomWinner!: (battleRoomInfo: {
    id: string
    winnerUid: string
    message?: string
  }) => void

  @Prop({ default: Function })
  setBattleStartAt!: (battleInfo: {
    id: string
    hostOrGuest: 'host' | 'guest'
  }) => void

  private lastIntervalId: NodeJS.Timeout | undefined = undefined
  private isOpen: boolean = false

  public timer: number = 0
  public isNearlyTimeOut: boolean = false
  public TIME_LIMIT = 180

  created() {
    const battleStartAt = this.battleRoom[this.isHostOrGuest].battleStartAt
    if (!battleStartAt) {
      this.setBattleStartAt({
        id: this.battleRoom.id,
        hostOrGuest: this.isHostOrGuest
      })
    } else {
      this.timer = Math.round(
        (new Date().getTime() - battleStartAt.toDate().getTime()) / 1000
      )
    }
  }

  mounted() {
    this.setMyTimer()
  }

  destroyed() {
    if (this.lastIntervalId) {
      clearInterval(this.lastIntervalId)
    }
  }

  setMyTimer() {
    this.lastIntervalId = setInterval(() => {
      if (this.timer > OPPONENT_OFFLINE_TIME) {
        this.setBattleRoomWinner({
          id: this.battleRoom.id,
          winnerUid: this.storeUser.uid,
          message: '対戦相手がオフラインのため勝利しました'
        })
      } else if (this.timer >= this.TIME_LIMIT) {
        this.isNearlyTimeOut = false
        this.$emit('deployEnd')
      } else if (this.timer >= NEARLY_TIME_OUT) {
        this.isNearlyTimeOut = true
        this.timer += 1
      } else {
        this.timer += 1
      }
    }, 1000)
  }

  onEndDeploy() {
    if (this.lastIntervalId) {
      clearInterval(this.lastIntervalId)
    }
    this.$emit('deployEnd')
  }

  tryCloseModal() {
    if (!this.isDeployModeEnd) {
      this.isOpen = false
    }
  }

  @Watch('isDeployModeEnd', { immediate: true })
  onChangeDeployModeEnd(_: boolean) {
    this.isOpen = true
  }

  get time() {
    return this.timer > this.TIME_LIMIT ? this.TIME_LIMIT : this.timer
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
