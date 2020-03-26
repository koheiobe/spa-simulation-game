<template>
  <div>
    <Field :characters="characters" :deployable-areas="deployableAreas" />
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue } from 'vue-property-decorator'
import Field from '~/components/battle/Field.vue'
import Character from '~/class/character/playableCharacter'
import { IDeployableArea } from '~/types/battle'

@Component({
  components: { Field }
})
export default class OnlineBattleRoom extends Vue {
  public characters: Character[] = []
  public deployableAreas: IDeployableArea[] = [
    {
      upperLeft: {
        x: 50,
        y: 10
      },
      upperRight: {
        x: 55,
        y: 10
      },
      lowerLeft: {
        x: 50,
        y: 20
      },
      lowerRight: {
        x: 55,
        y: 20
      }
    }
  ]

  created() {
    for (let i = 1; i <= 30; i++) {
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
        id: i
      })
      this.characters.push(character)
    }
  }
}
</script>

<style lang="scss" module></style>
