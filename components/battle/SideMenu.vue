<template>
  <div>
    <SideMenuRightIcon
      v-if="!isOpenSideMenu"
      :class="$style.sideMenuOpener"
      @click="toggleSideMenu()"
    />
    <transition name="sideMenuAnim">
      <div v-if="isOpenSideMenu" :class="$style.sideMenu">
        <div :class="$style.sideMenuContent">
          <div
            v-for="character in characters"
            :key="character.id"
            :class="$style.iconContainer"
            :style="selectedBorderStyle(character.id)"
          >
            <CharacterRenderer
              :id="character.id"
              :is-deployed="isDeployed(character)"
              @click.native.stop="onClickCharacter(character.id)"
            />
          </div>
          <button @click="$emit('onSurrender')">降参する</button>
        </div>
        <SideMenuLeftIcon @click="toggleSideMenu()" />
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue, Prop } from 'vue-property-decorator'
import SideMenuLeftIcon from '~/assets/img/leftArrow.svg'
import SideMenuRightIcon from '~/assets/img/rightArrow.svg'
import CharacterRenderer from '~/components/CharacterRenderer.vue'
import Character from '~/class/character/playableCharacter'
import { ICharacter } from '~/types/store'

@Component({
  components: {
    SideMenuLeftIcon,
    SideMenuRightIcon,
    CharacterRenderer
  }
})
export default class SideMenu extends Vue {
  @Prop({ default: () => [] })
  characters!: ICharacter[]

  @Prop({ default: () => [] })
  selectedCharacterId!: number

  public isOpenSideMenu: boolean = false

  selectedBorderStyle(id: number) {
    return this.selectedCharacterId === id ? { border: '0.5px solid red' } : ''
  }

  toggleSideMenu() {
    this.isOpenSideMenu = !this.isOpenSideMenu
  }

  isDeployed(character: Character) {
    return character.latLng.x >= 0 && character.latLng.y >= 0
  }

  onClickCharacter(id: string) {
    this.$emit('onClickCharacter', id)
  }
}
</script>

<style lang="scss" module>
.sideMenuOpener {
  position: fixed;
}
.sideMenu {
  position: fixed;
  width: 250px;
  height: 100vh;
  background-color: blue;
  display: flex;
  transition: 0.5s;
  align-items: center;
  .sideMenuContent {
    padding: 16px;
    height: 100%;
    width: 100%;
    margin-right: auto;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    .iconContainer {
      margin-right: 8px;
      width: 50px;
      height: 50px;
    }
  }
  .sideMenuCloser {
  }
}
</style>

<style lang="scss" scoped>
/* アニメーション用 */
.sideMenuAnim {
  &-enter-active {
    transform: translateX(-300px);
    transition: transform 1000ms 0ms;
  }
  &-enter-to {
    transform: translate(0px, 0px);
  }
  &-leave-active {
    transform: translate(0px, 0px);
    transition: transform 1000ms 0ms;
  }
  &-leave-to {
    transform: translateX(-300px);
  }
}
</style>
