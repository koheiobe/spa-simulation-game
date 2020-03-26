<template>
  <div :class="$style.field" @click="fieldClick">
    <SideMenu
      :characters="characters"
      :selected-character-id="selectedCharacterId"
      @onClickCharacter="onClickSideMenuCharacter"
    />
    <div v-for="n of 100" :key="n" :class="$style.row">
      <template v-for="l of 100">
        <FieldCell
          :key="`${n}-${l}`"
          :is-character-placable-cell="
            isMovableArea({ x: l, y: n }) || isDeployableArea({ x: l, y: n })
          "
          :character="getCharacter({ x: l, y: n })"
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
import { ILatlng, IDeployableArea } from '~/types/battle'
import FieldCell from '~/components/battle/FieldCell.vue'
import SideMenu from '~/components/battle/SideMenu.vue'
import Character from '~/class/character/playableCharacter'

@Component({
  components: {
    FieldCell,
    SideMenu
  }
})
export default class Field extends Vue {
  @Prop({ default: () => [] })
  characters!: Character[]

  @Prop({ default: () => [] })
  deployableAreas!: IDeployableArea[]

  // デプロイモードプロパティ
  public deployableArea: ILatlng[] = []
  public selectedCharacterId: number = 0
  public deployMode: boolean = false

  // 戦闘モードプロパティ
  // 各characterの移動距離と置き換え
  public moveNum = 8
  public movableRange: ILatlng[] = []
  public interactCharacterId: number = 0
  mounted() {
    this.fillDeployableArea()
  }

  fieldClick() {
    this.deployMode = false
  }

  onClickCell(latLng: ILatlng, isPlacable: boolean, characterId: number) {
    this.movableRange = []
    // 戦闘開始前のデプロイモード時
    if (this.deployMode) {
      if (isPlacable && characterId < 0) {
        this.characters.forEach((character) => {
          if (this.selectedCharacterId === character.id) {
            character.latLng = latLng
            character.isDeployed = true
          }
        })
        this.selectedCharacterId = 0
      } else if (characterId > 0) {
        this.characters.forEach((character) => {
          if (characterId === character.id) {
            character.latLng = { x: -1, y: -1 }
            character.isDeployed = false
          }
        })
      } else {
        this.selectedCharacterId = 0
      }
      // 通常戦闘時
    } else if (characterId > 0) {
      this.interactCharacterId = characterId
      this.fillMovableRange(latLng)
    } else if (isPlacable && characterId < 0) {
      this.characters.forEach((character) => {
        if (this.interactCharacterId === character.id) character.latLng = latLng
      })
      this.interactCharacterId = 0
    } else {
      this.interactCharacterId = 0
    }
  }

  fillMovableRange(latLng: ILatlng) {
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
    return !this.deployMode
      ? this.movableRange.some(
          (movable) => movable.x === latLng.x && movable.y === latLng.y
        )
      : false
  }

  onClickSideMenuCharacter(id: number) {
    this.selectedCharacterId = id
    this.deployMode = true
  }

  isDeployableArea(latLng: ILatlng) {
    return this.deployMode
      ? this.deployableArea.some(
          (movable) => movable.x === latLng.x && movable.y === latLng.y
        )
      : false
  }

  fillDeployableArea() {
    this.deployableAreas.forEach((deployableArea) => {
      for (
        let i = deployableArea.upperLeft.y;
        i <= deployableArea.lowerLeft.y;
        i++
      ) {
        for (
          let j = deployableArea.upperLeft.x;
          j <= deployableArea.upperRight.x;
          j++
        ) {
          this.deployableArea.push({ x: j, y: i })
        }
      }
    })
  }

  getCharacter(latLng: ILatlng) {
    return this.characters.find(
      (character) =>
        character.latLng.x === latLng.x && character.latLng.y === latLng.y
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
