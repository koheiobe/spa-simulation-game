<template>
  <div>
    <Centaur
      v-if="characterName === 'Centaur'"
      :class="[isDeployed ? $style.deployed : '']"
    />
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue, Prop } from 'vue-property-decorator'
import Centaur from '~/assets/centaur.svg'

@Component({
  components: { Centaur }
})
export default class CharacterRenderer extends Vue {
  @Prop({ default: 0 })
  id!: string

  @Prop({ default: false })
  isDeployed?: boolean

  get characterName() {
    return this.id.replace(/[0-9]+$/, '')
  }
}
</script>

<style lang="scss" module>
.deployed {
  opacity: 0.5;
}
</style>
