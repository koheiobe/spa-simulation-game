<template>
  <div>
    <Field :characters="characters" :deployable-areas="deployableAreas" />
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue } from 'vue-property-decorator'

import Field from '~/components/battle/Field.vue'
import { ICharacter } from '~/types/store'
import { IDeployableArea } from '~/types/battle'

@Component({
  components: { Field }
})
export default class OnlineBattleRoom extends Vue {
  public characters: ICharacter[] = []
  public deployableAreas: IDeployableArea[] = [
    {
      upperLeft: {
        x: 25,
        y: 5
      },
      upperRight: {
        x: 30,
        y: 5
      },
      lowerLeft: {
        x: 25,
        y: 10
      },
      lowerRight: {
        x: 30,
        y: 10
      }
    }
  ]

  created() {
    for (let i = 1; i <= 30; i++) {
      const character: ICharacter = {
        name: 'Centaur',
        hp: 90,
        attackPoint: 10,
        defense: 10,
        critical: 5,
        luck: 10,
        speed: 10,
        level: 1,
        moveDistance: 5,
        id: `Centaur${i}`,
        latLng: { x: -1, y: -1 },
        lastLatLng: { x: -1, y: -1 },
        actionState: { name: '', itemId: 0 }
      }
      this.characters.push(character)
    }
  }

  mounted() {
    window.scrollTo(1000, 0)
  }
}
</script>

<style lang="scss" module></style>
