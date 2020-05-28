<template functional>
  <div
    :class="[$style.cell, props.cellType ? $style.characterPlacableCell : '']"
    :style="{
      backgroundImage: $options.methods.getFieldBackgroundUrl(
        props.field
          ? $options.methods.getFieldBackgroundType(props.field, props.latLng)
          : '',
        props.latLng
      )
    }"
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
    <template v-if="props.character">
      <CharacterRenderer
        :id="props.character.id"
        :character="props.character"
        :is-end="props.character.actionState.isEnd"
        :width="30"
      />
      <b-tooltip
        triggers="hover"
        variant="primary"
        :target="props.character.id"
        :class="$style.characterToolTip"
      >
        Name: {{ props.character.name }} <br />
        HP: {{ props.character.hp }} / {{ props.character.maxHp }}
      </b-tooltip>
    </template>
    <!-- 開発用 -->
    <!-- <div v-else :class="$style.latLngCell">
      {{ `${props.latLng.y}_${props.latLng.x}` }}
    </div> -->
  </div>
</template>

<script lang="ts">
import { ILatlng } from 'types/battle'
import { ICharacter } from '~/types/store'
import { CellType, IField } from '~/types/battle'
import CharacterRenderer from '~/components/CharacterRenderer.vue'
const Grass = require('~/assets/img/field/grass.png')
const Grass2 = require('~/assets/img/field/grass2.png')
const Castle = require('~/assets/img/field/castle.png')
const Mountain = require('~/assets/img/field/mountain.png')
const Forest = require('~/assets/img/field/forest.png')

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
    },
    field: {
      default: (): IField | null => null,
      type: Object,
      require: true
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
      // TODO: functional componentではrefが効かないので回避方法を探す
      // this.$refs.tooltip.$emit('close')
      if (cellType) {
        evt.stopPropagation()
      }
      const characterId = character === undefined ? '' : character.id
      listeners.onClick(cellType, latLng, characterId)
    },
    getFieldBackgroundUrl(fieldType: string, latLng: ILatlng) {
      switch (fieldType) {
        case 'mountain':
          return `url(${Mountain})`
        case 'forest':
          return `url(${Forest})`
        case 'castle':
          return `url(${Castle})`
      }
      if (latLng.y % 2 !== 0) {
        return latLng.x % 2 === 0 ? `url(${Grass2})` : `url(${Grass})`
      } else {
        return latLng.x % 2 !== 0 ? `url(${Grass2})` : `url(${Grass})`
      }
    },
    getFieldBackgroundType(field: IField, latLng: ILatlng) {
      return field[`${latLng.y}_${latLng.x}`]
        ? field[`${latLng.y}_${latLng.x}`].type
        : ''
    }
  }
}
</script>

<style lang="scss" module>
.cell {
  min-width: 30px;
  height: 30px;
  &:hover {
    background-color: rgba(230, 230, 230, 0.8);
    background-blend-mode: lighten;
  }
  img {
    width: 30px;
  }
}
.characterPlacableCell {
  background-color: rgba(230, 230, 230, 0.8);
  background-blend-mode: lighten;
  &:hover {
    background-color: blue;
  }
}

// 開発用
.latLngCell {
  font-size: 8px;
}
</style>
