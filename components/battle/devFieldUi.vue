<template>
  <div :class="$style.container">
    <ul :class="$style.pngList">
      <li>
        <b-form-checkbox
          :checked="isDevMode"
          switch
          class="mr-n2"
          @change="onChangeDevMode"
        />
      </li>
      <li @click="selectFieldIcon('')">
        削除
      </li>
      <li>
        <img :src="castle" @click="selectFieldIcon('castle')" />
      </li>
      <li>
        <img :src="mountain" @click="selectFieldIcon('mountain')" />
      </li>
      <li>
        <img :src="forest" @click="selectFieldIcon('forest')" />
      </li>
      <li>
        <b-button variant="primary" @click="saveFieldJson">保存</b-button>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue, Prop } from 'vue-property-decorator'

@Component
export default class DevFieldUi extends Vue {
  @Prop({ default: false })
  isDevMode!: boolean

  private castle = require('@/assets/img/field/castle.png')
  private mountain = require('@/assets/img/field/mountain.png')
  private forest = require('@/assets/img/field/forest.png')

  onChangeDevMode() {
    this.$emit('onChangeDevMode')
  }

  selectFieldIcon(fieldType: string) {
    this.$emit('onSelectFieldIcon', fieldType)
  }

  saveFieldJson() {
    this.$emit('saveFieldJson')
  }
}
</script>

<style lang="scss" module>
.container {
  display: flex;
  justify-content: center;
  background-color: white;
}
.pngList {
  list-style: none;
  li {
    cursor: pointer;
    display: inline-block;
    margin-right: 5px;
  }
}
</style>
