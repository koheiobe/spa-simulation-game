<template>
  <div :class="$style.cell" :style="moveArea" @click="onClick">
    <CharacterRenderer v-if="character !== undefined" :id="character.id" />
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue, Prop } from 'vue-property-decorator'
import { ILatlng } from 'types/battle'
import CharacterRenderer from '~/components/CharacterRenderer.vue'
import Character from '~/class/character'

@Component({
  components: { CharacterRenderer }
})
export default class FieldCell extends Vue {
  @Prop({ default: () => {} })
  latLng!: ILatlng

  @Prop({ default: false })
  isMovableArea?: boolean

  @Prop({ default: undefined })
  character?: Character

  get moveArea() {
    return this.isMovableArea
      ? {
          backgroundColor: '#e6e6e6'
        }
      : ''
  }

  onClick() {
    this.$emit('onClick', this.latLng)
  }
}
</script>

<style lang="scss" module>
.cell {
  min-width: 30px;
  height: 30px;
  &:hover {
    background-color: #e6e6e6;
  }
  // border: 1px solid black;
}
</style>
