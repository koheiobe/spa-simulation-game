<template>
  <div :class="$style.container">
    <Battle
      v-if="isDeployModeEnd && turnNumber !== 0"
      :battle-room="battleRoom"
      :store-user="storeUser"
      :is-my-turn="isMyTurn"
      :turn-uid="turnUid"
      :set-opponent-offline-times="setOpponentOfflineTimes"
      :set-battle-room-winner="setBattleRoomWinner"
      @turnEnd="$emit('turnEnd')"
    />
    <Deploy
      v-else
      :battle-room="battleRoom"
      :store-user="storeUser"
      :is-deploy-mode-end="isDeployModeEnd"
      :is-host-or-guest="isHostOrGuest"
      :set-battle-room-winner="setBattleRoomWinner"
      :set-battle-start-at="setBattleStartAt"
      @deploy-end="$emit('deploy-end')"
    />
    <div>
      <BIconGearFill :class="$style.gearIcon" @click="openOptionModal" />
    </div>
    <Modal :is-open="isOptionModalOpen" @onClickOuter="closeOptionModal">
      <Option
        :turn-number="String(turnNumber)"
        :is-my-turn="isMyTurn ? 'あなたのターンです' : '相手のターンです'"
        @surrender="$emit('surrender')"
      />
    </Modal>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { BIconGearFill } from 'bootstrap-vue'
import { Vue, Prop } from 'vue-property-decorator'
import Option from '../ModalContent/option.vue'
import Battle from './battle.vue'
import Deploy from './deploy.vue'
import { IBattleRoomRes, IUser } from '~/types/store'
import Modal from '~/components/utility/Modal.vue'

@Component({
  components: {
    Battle,
    Deploy,
    BIconGearFill,
    Modal,
    Option
  }
})
export default class BattleRoomHeader extends Vue {
  @Prop({ default: undefined })
  battleRoom!: IBattleRoomRes

  @Prop({ default: undefined })
  storeUser?: IUser

  @Prop({ default: false })
  isMyTurn!: boolean

  @Prop({ default: '' })
  turnUid!: string

  @Prop({ default: undefined })
  setOpponentOfflineTimes!: (battleRoomInfo: {
    id: string
    hostOrGuest: 'host' | 'guest'
    offlineTimes: number
  }) => void

  @Prop({ default: undefined })
  setBattleRoomWinner!: (battleRoomInfo: {
    id: string
    winnerUid: string
    message?: string
  }) => void

  @Prop({ default: undefined })
  setBattleStartAt!: (battleInfo: {
    id: string
    hostOrGuest: 'host' | 'guest'
  }) => void

  @Prop({ default: false })
  isDeployModeEnd!: boolean

  @Prop({ default: '' })
  isHostOrGuest!: 'host' | 'guest'

  public isOptionModalOpen: boolean = false

  openOptionModal() {
    this.isOptionModalOpen = true
  }

  closeOptionModal() {
    this.isOptionModalOpen = false
  }

  get turnNumber() {
    return this.battleRoom.turn.number
  }
}
</script>

<style lang="scss" module>
.container {
  padding: 8px;
  display: flex;
  align-items: center;

  .gearIcon {
    cursor: pointer;
    width: 30px;
    height: 30px;
    fill: white;
  }
}
</style>
