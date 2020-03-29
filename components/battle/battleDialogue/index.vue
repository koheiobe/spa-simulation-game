<template>
  <div>
    <ul v-if="selectedAction === 'none'" :class="$style.actionOptions">
      <li @click="onSelectAction('attack')">攻撃</li>
      <li @click="onSelectAction('wait')">待機</li>
      <li @click="onSelectAction('item')">アイテム</li>
    </ul>
    <div v-if="selectedAction === 'item'">
      <ul :class="$style.itemOptions">
        <template v-for="(item, idx) in ['dd', 'dd', 'dd', 'dd', 'dd', 'dd']">
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
      <b-button @click="backToTop">戻る</b-button>
    </div>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue } from 'vue-property-decorator'
import { ActionType } from '~/types/battle'
import Modal from '~/components/utility/Modal.vue'

@Component({
  components: {
    Modal
  }
})
export default class BattleDialogue extends Vue {
  public itemList: string[] = ['dd', 'dd', 'dd', 'dd', 'dd', 'dd']
  public selectedAction: ActionType = 'none'
  public isItemModalOpen: boolean = false

  onSelectAction(action: ActionType) {
    switch (action) {
      case 'attack':
        this.$emit('onSelect', 'attack')
        break
      case 'wait':
        this.$emit('onSelect', 'wait')
        break
      case 'item':
        this.selectedAction = 'item'
        break
    }
  }

  onSelectItem() {
    this.$emit('onSelect', 'item')
  }

  backToTop() {
    this.selectedAction = 'none'
  }
}
</script>

<style lang="scss" module>
.baseOptions {
  padding: 0;
  list-style: none;
  li {
    cursor: pointer;
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
