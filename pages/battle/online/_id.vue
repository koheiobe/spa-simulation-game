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
        actionState: { name: '' }
      }
      this.characters.push(character)
    }
  }
}
</script>

<style lang="scss" module></style>
