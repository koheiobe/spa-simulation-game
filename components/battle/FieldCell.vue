<template functional>
  <div
    :class="[$style.cell, props.cellType ? $style.characterPlacableCell : '']"
    @click="
      (evt) =>
        $options.methods.onClick(
          evt,
          props.cellType,
          props.character,
          props.latLng,
          listeners
        )
    "
  >
    <CharacterRenderer v-if="props.character" :id="props.character.id" />
  </div>
</template>

<script lang="ts">
import { ILatlng } from 'types/battle'
import { ICharacter } from '~/types/store'
import { CellType } from '~/types/battle'
import CharacterRenderer from '~/components/CharacterRenderer.vue'

export default {
  name: 'FieldCell',
  components: {
    CharacterRenderer
  },
  props: {
    latLng: {
      default: (): ILatlng => ({ x: 0, y: 0 }),
      type: Object,
      require: true
    },
    cellType: {
      default: null,
      type: String,
      require: true
    },
    character: {
      default: (): ICharacter | undefined => undefined,
      type: Object
    }
  },
  methods: {
    onClick(
      evt: Event,
      cellType: CellType,
      character: ICharacter,
      latLng: ILatlng,
      listeners: any
    ) {
      if (cellType) {
        evt.stopPropagation()
      }
      const characterId = character === undefined ? '' : character.id
      listeners.onClick(cellType, latLng, characterId)
    }
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
  img {
    width: 30px;
  }
}
.characterPlacableCell {
  background-color: #e6e6e6;
  &:hover {
    background-color: blue;
  }
}
</style>
