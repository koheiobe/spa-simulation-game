<template>
  <div>
    <ul v-if="selectedAction === 'none'" :class="$style.actionOptions">
      <li @click="onSelectAction('attack')">dd</li>
      <li @click="onSelectAction('wait')">dd</li>
      <li @click="onSelectAction('item')">dd</li>
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
        this.$emit('onSelec', 'wait')
        break
      case 'item':
        this.selectedAction = 'item'
        break
    }
  }

  onSelectItem() {
    this.$emit('onSelect', 'item')
  }
}
</script>

<style lang="scss" module>
.baseOptions {
  padding: 0;
  list-style: none;
  display: inline-block;
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
