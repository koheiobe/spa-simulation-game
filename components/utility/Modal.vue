<template>
  <div v-if="isOpen" ref="outer" :class="$style.outer" @click="onClickOuter">
    <div :class="$style.container" :style="containerStyle">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue, Prop } from 'vue-property-decorator'

@Component
export default class Modal extends Vue {
  @Prop({ default: false })
  isOpen!: boolean

  @Prop({ default: 0 })
  width?: number

  @Prop({ default: 0 })
  height?: number

  onClickOuter(evt: MouseEvent) {
    evt.stopPropagation()
    if (evt.target === this.$refs.outer) {
      this.$emit('onClickOuter')
    }
  }

  get containerStyle() {
    return {
      width: this.width === 0 ? 'auto' : this.width + 'px',
      height: this.height === 0 ? 'auto' : this.height + 'px'
    }
  }
}
</script>

<style lang="scss" module>
.outer {
  width: 100vw;
  height: 100vh;
  background-color: rgba(80, 80, 80, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  .container {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    background-color: white;
    border-radius: 4px;
    padding: 16px 32px;
  }
}
</style>
