<template>
  <div>
    <img
      v-if="characterName === 'Centaur'"
      src="~/assets/img/character/centaur.svg"
      :class="[isDeployed ? $style.deployed : '']"
    />
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue, Prop } from 'vue-property-decorator'
import Centaur from '~/assets/img/character/centaur.svg'

@Component({
  components: { Centaur }
})
export default class CharacterRenderer extends Vue {
  @Prop({ default: 0 })
  id!: string

  @Prop({ default: false })
  isDeployed?: boolean

  mounted() {
    console.log(Centaur)
  }

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
