<template>
  <div :class="$style.container">
    <div :class="$style.createButtonContainer">
      <b-button @click="onCreateBattleRoom">create room</b-button>
    </div>
    <b-list-group :class="$style.listContainer">
      <b-list-group-item
        v-for="battleRoom in battleRooms"
        :key="battleRoom.id"
        :class="$style.listItem"
        @click="goToBattleRoom(battleRoom.id)"
        >{{ battleRoom.host && battleRoom.host.name }}</b-list-group-item
      >
    </b-list-group>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { IUser, IBattleRoom } from '~/types/store'
const UserModule = namespace('user')
const BattleRoomsModule = namespace('battleRooms')

@Component({})
export default class OnlineBattle extends Vue {
  @UserModule.Getter('getUser')
  private storeUser!: IUser

  @BattleRoomsModule.Getter('getBattles')
  private storeBattleRooms!: IBattleRoom[]

  @BattleRoomsModule.Action('bindBattleRoomsRef')
  private bindBattleRoomsRef!: (ref: any) => void

  @BattleRoomsModule.Action('setBattleRoomRef')
  private setBattleRoomRef!: (ref: any) => void

  @BattleRoomsModule.Action('setBattleRoomGuest')
  private setBattleRoomGuest!: (userInfo: {
    uid: string
    name: string
    battleId: string
  }) => void

  @BattleRoomsModule.Action('createBattleRoom')
  private createBattleRoom!: (userInfo: {
    uid: string
    name: string
  }) => Promise<
    firebase.firestore.DocumentReference<firebase.firestore.DocumentData>
  >

  @BattleRoomsModule.Action('setBattleId')
  private setBattleId!: (userInfo: { uid: string; battleId: string }) => void

  get battleRooms() {
    return this.storeBattleRooms
  }

  mounted() {
    // すでにbattleRoomが存在した場合、その部屋に遷移させる
    if (this.storeUser.battleId) {
      this.$router.push(`/battle/online/${this.storeUser.battleId}`)
    }
    this.syncFirestoreVuexBattleRooms()
  }

  async onCreateBattleRoom() {
    const battleRoomRef = await this.createBattleRoom({
      uid: this.storeUser.uid,
      name: this.storeUser.name
    })
    this.setBattleId({ uid: this.storeUser.uid, battleId: battleRoomRef.id })
    this.$router.push(`/battle/online/${battleRoomRef.id}`)
  }

  goToBattleRoom(battleId: string) {
    this.setBattleId({ uid: this.storeUser.uid, battleId })
    this.setBattleRoomGuest({
      uid: this.storeUser.uid,
      name: this.storeUser.name,
      battleId
    })
    this.$router.push(`/battle/online/${battleId}`)
  }

  syncFirestoreVuexBattleRooms() {
    this.bindBattleRoomsRef(this.$firestore.getBattleRoomsRef())
  }
}
</script>

<style lang="scss" module>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;

  .createButtonContainer {
    margin-bottom: 16px;
  }

  .listContainer {
    min-width: 300px;

    .listItem {
      cursor: pointer;
    }
  }
}
</style>
