<template>
  <div :class="$style.container">
    <div :class="$style.createButtonContainer">
      <b-button @click="onCreateBattleRoom">クリエイト ルーム</b-button>
    </div>
    <b-list-group :class="$style.listContainer">
      <b-list-group-item
        v-for="battleRoom in battleRooms"
        :key="battleRoom.id"
        :class="$style.listItem"
        @click="onClickBattleRoomList(battleRoom.id)"
        >{{ battleRoom.host && battleRoom.host.name }}</b-list-group-item
      >
    </b-list-group>
    <Modal :is-open="isOpneWaitingMatchModal" :width="400" :height="200">
      {{
        isBattleMatched
          ? 'マッチングしましたので戦闘を開始します。'
          : 'マッチングしています...'
      }}
      <div class="text-center" :class="$style.spinnerContainer">
        <b-spinner variant="primary" type="grow" label="Spinning"></b-spinner>
      </div>
      <b-button v-if="!isBattleMatched" @click="cancelHosting"
        >キャンセル</b-button
      >
    </Modal>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import Modal from '~/components/utility/Modal.vue'
import { IUser, IBattleRoomRes } from '~/types/store'
const UserModule = namespace('user')
const BattleRoomModule = namespace('battleRoom')
const FieldModule = namespace('field')

@Component({
  components: {
    Modal
  }
})
export default class OnlineBattle extends Vue {
  @UserModule.Getter('getUser')
  private storeUser!: IUser

  @BattleRoomModule.Getter('getBattles')
  private storeBattleRooms!: IBattleRoomRes[]

  @BattleRoomModule.Action('bindBattleRoomList')
  private bindBattleRoomList!: (ref: any) => void

  @BattleRoomModule.Action('setBattleRoomRef')
  private setBattleRoomRef!: (ref: any) => void

  @BattleRoomModule.Action('setBattleRoomGuest')
  private setBattleRoomGuest!: (userInfo: {
    uid: string
    name: string
    battleId: string
  }) => void

  @BattleRoomModule.Action('createBattleRoom')
  private createBattleRoom!: (userInfo: {
    uid: string
    name: string
  }) => Promise<
    firebase.firestore.DocumentReference<firebase.firestore.DocumentData>
  >

  @BattleRoomModule.Action('setUserBattleId')
  private setUserBattleId!: (userInfo: {
    uid: string
    battleId: string
  }) => void

  @BattleRoomModule.Action('deleteUserBattleId')
  private deleteUserBattleId!: (uid: string) => void

  @BattleRoomModule.Action('deleteBattleRoom')
  private deleteBattleRoom!: (battleId: string) => Promise<null>

  @BattleRoomModule.Action('bindBattleRoomRef')
  private bindBattleRoomRef!: (ref: any) => void

  @FieldModule.Action('setFieldController')
  private setFieldController!: (stageId: number) => void

  private isOpneWaitingMatchModal: boolean = false
  private setTimeId: NodeJS.Timeout | null = null

  async mounted() {
    await this.syncFirestoreVuexBattleRooms()
    this.deleteBattleIdIfNeeded()

    if (this.isBattleRoomExist) {
      this.isOpneWaitingMatchModal = true
    }
  }

  destroyed() {
    if (this.setTimeId) {
      clearTimeout(this.setTimeId)
    }
  }

  async onCreateBattleRoom() {
    const battleRoomRef = await this.createBattleRoom({
      uid: this.storeUser.uid,
      name: this.storeUser.name
    })
    this.setUserBattleId({
      uid: this.storeUser.uid,
      battleId: battleRoomRef.id
    })
    this.isOpneWaitingMatchModal = true
  }

  async onClickBattleRoomList(battleId: string) {
    await this.setBattleRoomInfo(battleId)
    this.goToBattleRoom()
  }

  async setBattleRoomInfo(battleId: string) {
    await this.setUserBattleId({ uid: this.storeUser.uid, battleId })
    await this.setBattleRoomGuest({
      uid: this.storeUser.uid,
      name: this.storeUser.name,
      battleId
    })
  }

  async cancelHosting() {
    if (this.storeUser.battleId) {
      await this.deleteBattleRoom(this.storeUser.battleId)
      this.deleteUserBattleId(this.storeUser.uid)
    }
    this.isOpneWaitingMatchModal = false
  }

  syncFirestoreVuexBattleRooms() {
    return this.bindBattleRoomList(this.$firestore.getBattleRoomsRef())
  }

  deleteBattleIdIfNeeded() {
    if (this.storeUser.battleId && !this.isBattleRoomExist) {
      // HACK 前回の戦闘終了前にページ離脱していた場合、battleIdが残っているため削除
      // もしIDが残ることが気持ち悪いならCloudFunctionなどを使って強制的に削除する
      this.deleteUserBattleId(this.storeUser.uid)
    }
  }

  async goToBattleRoom() {
    if (this.storeUser.battleId) {
      // TODO: ステージを選択できるようにするなら、ここを可変にする
      this.setFieldController(1)
      await this.bindBattleRoomRef(
        this.$firestore.getBattleRoomRef(this.storeUser.battleId)
      )
      this.$router.push(`/battle/online/${this.storeUser.battleId}`)
    }
  }

  @Watch('isBattleMatched')
  onMatched(cur: boolean) {
    if (cur) {
      this.setTimeId = setTimeout(() => {
        this.goToBattleRoom()
      }, 1000)
    }
  }

  get battleRooms() {
    return this.storeBattleRooms.filter(
      (battleRoom) => !battleRoom.host.uid || !battleRoom.guest.uid
    )
  }

  get isBattleRoomExist() {
    return Boolean(
      this.storeBattleRooms.find(
        (battleRoom) => battleRoom.id === this.storeUser.battleId
      )
    )
  }

  get isBattleMatched() {
    const battleRoom = this.storeBattleRooms.find(
      (battleRoom) => battleRoom.id === this.storeUser.battleId
    )
    if (!battleRoom) {
      return false
    } else {
      return battleRoom.host.uid.length > 0 && battleRoom.guest.uid.length > 0
    }
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

  .spinnerContainer {
    margin: 16px 0;
  }

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
