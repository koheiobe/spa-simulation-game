<template>
  <div
    :class="[
      $style.cell,
      isCharacterPlacableCell ? $style.characterPlacableCell : ''
    ]"
    @click="onClick"
  >
    <CharacterRenderer v-if="character !== undefined" :id="character.id" />
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue, Prop } from 'vue-property-decorator'
import { ILatlng } from 'types/battle'
import CharacterRenderer from '~/components/CharacterRenderer.vue'
import Character from '~/class/character/playableCharacter'

@Component({
  components: { CharacterRenderer }
})
export default class FieldCell extends Vue {
  @Prop({ default: () => {} })
  latLng!: ILatlng

  @Prop({ default: false })
  isCharacterPlacableCell?: boolean

  @Prop({ default: undefined })
  character?: Character

  onClick(evt: Event) {
    // placableCell以外をクリックした場合、deployModeをfalseにするために使用
    if (this.isCharacterPlacableCell) {
      evt.stopPropagation()
    }
    const characterId = this.character === undefined ? -1 : this.character.id
    this.$emit(
      'onClick',
      this.latLng,
      this.isCharacterPlacableCell,
      characterId
    )
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
}
.characterPlacableCell {
  background-color: #e6e6e6;
  &:hover {
    background-color: blue;
  }
}
</style>
