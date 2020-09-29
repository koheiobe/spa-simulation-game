<template>
  <div>
    <b-button
      v-if="!isOpenSideMenu"
      pill
      variant="danger"
      :class="$style.sideMenuOpener"
      @click="toggleSideMenu()"
    >
      PUSH !!
    </b-button>
    <transition name="sideMenuAnim">
      <div v-if="isOpenSideMenu" :class="$style.sideMenu">
        <div :class="$style.sideMenuContent">
          <template v-for="character in characters">
            <div
              v-if="isMyCharacter(character)"
              :key="character.id"
              :class="$style.iconContainer"
              :style="selectedBorderStyle(character.id)"
            >
              <CharacterRenderer
                :character="character"
                :is-deployed="isDeployed(character)"
                :is-host-or-guest="isHostOrGuest"
                @click.native.stop="onClickCharacter(character.id)"
              />
            </div>
          </template>
          <div :class="$style.closeButtonContainer">
            <b-button variant="primary" @click="toggleSideMenu()"
              >閉じる</b-button
            >
          </div>
          <div :class="$style.attributionContainer">
            Icon made by
            <a href="https://www.flaticon.com/authors/freepik">Freepik</a>
            from <a href="https://www.flaticon.com/">www.flaticon.com</a>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue, Prop } from 'vue-property-decorator'
import CharacterRenderer from '~/components/CharacterRenderer.vue'
import Character from '~/class/character/playableCharacter'
import { ICharacter } from '~/types/store'

@Component({
  components: {
    CharacterRenderer
  }
})
export default class SideMenu extends Vue {
  @Prop({ default: '' })
  isHostOrGuest!: 'host' | 'guest'

  @Prop({ default: () => [] })
  characters!: ICharacter[]

  @Prop({ default: () => -1 })
  selectedCharacterId!: number

  @Prop({ default: () => {} })
  isMyCharacter!: (character: ICharacter) => boolean

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
  top: 5px;
  left: 5px;
}
.sideMenu {
  position: fixed;
  max-width: 250px;
  width: 30%;
  height: 100vh;
  background-color: gray;
  display: flex;
  flex-direction: column;
  transition: 0.5s;
  align-items: center;
  overflow-y: scroll;
  .sideMenuContent {
    padding: 16px;
    width: 100%;
    margin-right: auto;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-content: flex-start;
    .iconContainer {
      margin: 4px;
      max-width: 50px;
      width: 35%;
      max-height: 50px;
    }
    .closeButtonContainer {
      padding: 8px;
    }
    .attributionContainer {
      padding: 8px;
    }
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
