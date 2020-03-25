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
          >
            <CharacterRenderer :id="character.id" />
          </div>
        </div>
        <SideMenuLeftIcon @click="toggleSideMenu()" />
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue, Prop } from 'vue-property-decorator'
import SideMenuLeftIcon from '~/assets/leftArrow.svg'
import SideMenuRightIcon from '~/assets/rightArrow.svg'
import CharacterRenderer from '~/components/CharacterRenderer.vue'
import Character from '~/class/character'

@Component({
  components: {
    SideMenuLeftIcon,
    SideMenuRightIcon,
    CharacterRenderer
  }
})
export default class SideMenu extends Vue {
  @Prop({ default: () => [] })
  characters!: Character[]

  mounted() {
    console.log(this.characters)
  }

  public isOpenSideMenu: boolean = false
  toggleSideMenu() {
    this.isOpenSideMenu = !this.isOpenSideMenu
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
    margin-right: auto;
    display: flex;
    .iconContainer {
      margin-right: 8px;
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
