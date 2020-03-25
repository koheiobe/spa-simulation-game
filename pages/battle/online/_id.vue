<template>
  <div>
    <Field :characters="characters" />
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue } from 'vue-property-decorator'
import Field from '~/components/battle/Field.vue'
import Character from '~/class/character'

@Component({
  components: { Field }
})
export default class OnlineBattleRoom extends Vue {
  public characters: Character[] = []
  mounted() {
    // classの初期化方法を考える!!
    const character = new Character({
      name: 'Centaur',
      hp: 10,
      attackPoint: 10,
      defense: 10,
      critical: 10,
      luck: 10,
      speed: 10,
      level: 10,
      moveDistance: 10,
      id: 1
    })
    console.log('character', character)
    this.characters = [character]
  }
}
</script>

<style lang="scss" module></style>
