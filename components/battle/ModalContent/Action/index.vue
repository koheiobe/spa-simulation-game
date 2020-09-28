<template>
  <div>
    <div :class="$style.characterNameContainer">Name: {{ characterName }}</div>
    <ul v-if="selectedAction === 'none'" :class="$style.actionOptions">
      <li
        v-if="!isDeploying && isMyTurn && isMyCharacter && !isEnd"
        @click="$emit('on-select', 'attack')"
      >
        攻撃
      </li>
      <li
        v-if="!isDeploying && isMyTurn && isMyCharacter && !isEnd"
        @click="$emit('on-select', 'wait')"
      >
        待機
      </li>
      <!-- TODO ミニマムリリースを目指すためアイテムは落とす -->
      <!-- <li v-if="isMyTurn" @click="selectedAction = 'item'">アイテム</li> -->
      <li @click="selectedAction = 'detail'">能力</li>
    </ul>
    <!-- <div v-if="selectedAction === 'item'">
      <ul :class="$style.itemOptions">
        <template v-for="(item, idx) in itemList">
          <li
            :id="`popover-target-${idx}`"
            :key="item + idx"
            @click="onSelectItem"
          >
            {{ item }}
          </li>
          <b-popover
            :key="`popover-${idx}`"
            :target="`popover-target-${idx}`"
            triggers="hover"
            placement="right"
          >
            <template v-slot:title>Popover Title</template>
            I am popover <b>component</b> content!
          </b-popover>
        </template>
      </ul>
      <b-button @click="backToTop">もどる</b-button>
    </div>-->
    <div v-if="selectedAction === 'detail'">
      <Detail :character-controller="characterController" />
    </div>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue, Prop } from 'vue-property-decorator'
import Detail from './CharacterDetail.vue'
import Modal from '~/components/utility/Modal.vue'
import CharacterController from '~/utility/helper/battle/character/characterController.ts'

@Component({
  components: {
    Modal,
    Detail
  }
})
export default class BattleDialogue extends Vue {
  @Prop({ default: () => {} })
  characterController!: CharacterController

  @Prop({ default: '' })
  isHostOrGuest!: string

  @Prop({ default: false })
  isMyTurn!: boolean

  @Prop({ default: false })
  isDeploying!: boolean

  public itemList: string[] = ['dd', 'dd', 'dd', 'dd', 'dd', 'dd']
  public selectedAction: 'item' | 'detail' | 'none' = 'none'
  public isItemModalOpen: boolean = false

  onSelectItem() {
    this.$emit('onSelect', 'item')
  }

  backToTop() {
    this.selectedAction = 'none'
  }

  get characterName() {
    const activeCharacter = this.characterController.getActiveCharacter()
    return activeCharacter ? activeCharacter.name : ''
  }

  get isEnd() {
    const activeCharacter = this.characterController.getActiveCharacter()
    return activeCharacter ? activeCharacter.actionState.isEnd : true
  }

  get isMyCharacter() {
    const activeCharacter = this.characterController.getActiveCharacter()
    return activeCharacter
      ? this.characterController.isMyCharacter(
          activeCharacter,
          this.isHostOrGuest
        )
      : false
  }
}
</script>

<style lang="scss" module>
.characterNameContainer {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
}
.baseOptions {
  padding: 0;
  list-style: none;
  li {
    cursor: pointer;
    &:hover {
      background-color: #e4e4e4;
    }
  }
}
.actionOptions {
  @extend .baseOptions;
}
.itemOptions {
  li {
    margin-bottom: 8px;
  }
  @extend .baseOptions;
}
</style>
