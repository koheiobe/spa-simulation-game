<template>
  <div>
    <p>{{ message }}</p>
    <p>winner: {{ winnerName }}</p>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue, Prop } from 'vue-property-decorator'

@Component
export default class EndBattleDialogue extends Vue {
  @Prop({ default: '' })
  winnerName!: string

  @Prop({ default: '' })
  message!: string
}
</script>

<style lang="scss" module></style>
