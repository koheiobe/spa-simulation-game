<template>
  <div :class="$style.iconContainer">
    <Centaur v-if="id === 1" />
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
  id!: number

  mounted() {
    console.log(this.id)
  }
}
</script>

<style lang="scss" module>
.iconContainer {
}
</style>
