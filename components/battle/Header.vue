<template>
  <div :class="$style.container">
    <BIconGearFill :class="$style.gearIcon" @click="openOptionModal" />
    <Modal :is-open="isOptionModalOpen" @onClickOuter="closeOptionModal">
      <Option @surrender="$emit('surrender')" />
    </Modal>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { BIconGearFill } from 'bootstrap-vue'
import { Vue } from 'vue-property-decorator'
import Option from './ModalContent/option.vue'
import Modal from '~/components/utility/Modal.vue'

@Component({
  components: {
    BIconGearFill,
    Modal,
    Option
  }
})
export default class BattleHeader extends Vue {
  public isOptionModalOpen: boolean = false
  openOptionModal() {
    this.isOptionModalOpen = true
  }

  closeOptionModal() {
    this.isOptionModalOpen = false
  }
}
</script>

<style lang="scss" module>
.container {
  padding: 8px;
  display: flex;

  .gearIcon {
    width: 30px;
    height: 30px;
  }
}
</style>
