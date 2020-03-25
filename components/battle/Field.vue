<template>
  <div :class="$style.field">
    <SideMenu :characters="characters" />
    <div v-for="n of 100" :key="n" :class="$style.row">
      <template v-for="l of 100">
        <FieldCell
          :key="`${n}-${l}`"
          :is-movable-area="isMovableArea({ x: l, y: n })"
          :lat-lng="{ x: l, y: n }"
          @onClick="onClickCell"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue, Prop } from 'vue-property-decorator'
import { ILatlng } from '~/types/battle'
import FieldCell from '~/components/battle/FieldCell.vue'
import SideMenu from '~/components/battle/SideMenu.vue'
import Character from '~/class/character'

@Component({
  components: {
    FieldCell,
    SideMenu
  }
})
export default class Field extends Vue {
  @Prop({ default: () => [] })
  characters!: Character[]

  // 各characterの移動距離と置き換え
  public moveNum = 8
  public movableRange: ILatlng[] = []

  onClickCell(latLng: ILatlng) {
    this.movableRange = []
    for (let i = -this.moveNum; i <= this.moveNum; i++) {
      const upperY = this.moveNum - Math.abs(i)
      const lowerY = -this.moveNum + Math.abs(i)
      for (let j = lowerY + 1; j < upperY; j++) {
        this.movableRange.push({
          x: latLng.x + i,
          y: latLng.y + j
        })
      }
    }
  }

  isMovableArea(latLng: ILatlng) {
    return this.movableRange.some(
      (movable) => movable.x === latLng.x && movable.y === latLng.y
    )
  }
}
</script>

<style lang="scss" module>
.field {
  // overflow: scroll;

  .row {
    display: flex;
  }
}
</style>
