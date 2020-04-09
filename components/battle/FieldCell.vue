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
    <slot />
  </div>
</template>

<script lang="ts">
import { ILatlng } from 'types/battle'
import { ICharacter } from '~/types/store'
import { CellType } from '~/types/battle'

export default {
  name: 'FieldCell',
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
// export default class FieldCell extends Vue {
//   @Prop({ default: () => {} })
//   latLng!: ILatlng

//   @Prop({ default: false })
//   isCharacterDeployableCell?: boolean

//   @Prop({ default: false })
//   isCharacterMovableCell?: boolean

//   @Prop({ default: false })
//   isInteractableCell?: boolean

//   @Prop({ default: undefined })
//   character?: ICharacter

//   onClick(evt: Event) {
//     // placableCell以外をクリックした場合、deployModeをfalseにするために使用
//     if (
//       this.isCharacterDeployableCell ||
//       this.isCharacterMovableCell ||
//       this.isInteractableCell
//     ) {
//       evt.stopPropagation()
//     }
//     const characterId = this.character === undefined ? '' : this.character.id
//     const cellType: CellType = this.isCharacterDeployableCell
//       ? 'deploy'
//       : this.isCharacterMovableCell
//       ? 'move'
//       : this.isInteractableCell
//       ? 'interact'
//       : 'selectCharacter'
//     this.$emit('onClick', cellType, this.latLng, characterId)
//   }
// }
</script>

<style lang="scss" module>
.cell {
  min-width: 30px;
  height: 30px;
  background-color: gray;
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
