<template>
  <div :class="$style.container">
    <div :class="$style.createButtonContainer">
      <b-button @click="createBattleRoom">create room</b-button>
    </div>
    <b-list-group :class="$style.listContainer">
      <b-list-group-item
        v-for="battleRoom in battleRooms"
        :key="battleRoom.id"
        :class="$style.listItem"
        @click="goToBattleRoom(battleRoom.id)"
        >{{ battleRoom.creater && battleRoom.creater.name }}</b-list-group-item
      >
    </b-list-group>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import {
  createBattleRoom,
  setBattleId,
  getBattleRooms
} from '~/plugins/database'
import { IUser, IBattleRoom } from '~/types/store'
const UserModule = namespace('user')
const BattleRoomsModule = namespace('battleRooms')

@Component({})
export default class OnlineBattle extends Vue {
  @UserModule.Getter('getUser')
  private storeUser!: IUser

  @BattleRoomsModule.Getter('getBattles')
  private storeBattleRooms!: IBattleRoom[]

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

  async createBattleRoom() {
    const battleRoomRef = await createBattleRoom(
      this.storeUser.uid,
      this.storeUser.name
    )
    setBattleId(this.storeUser.uid, battleRoomRef.id)
  }

  goToBattleRoom(battleId: string) {
    setBattleId(this.storeUser.uid, battleId)
    this.$router.push(`/battle/online/${battleId}`)
  }

  syncFirestoreVuexBattleRooms() {
    this.$store.dispatch('battleRooms/setBattleRoomsRef', getBattleRooms())
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
