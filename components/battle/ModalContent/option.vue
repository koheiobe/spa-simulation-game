<template>
  <div>
    <ul :class="$style.list">
      <li>勝利条件: 城を制圧する</li>
      <li>ターン数: {{ turnNumber }}</li>
      <li>{{ isMyTurn }}</li>
      <li><b-button @click="$emit('surrender')">降参する</b-button></li>
    </ul>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue, Prop } from 'vue-property-decorator'

@Component
export default class BttleOption extends Vue {
  @Prop({ default: 0 })
  turnNumber!: number

  @Prop({ default: '' })
  isMyTurn!: string
}
</script>

<style lang="scss" module>
.list {
  li {
    list-style: none;
    margin-bottom: 16px;
  }
}
</style>
