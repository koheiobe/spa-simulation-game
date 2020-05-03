<template>
  <div>
    <b-button @click="$emit('surrender')">降参する</b-button>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue, Prop } from 'vue-property-decorator'

@Component
export default class BttleOption extends Vue {
  @Prop({ default: '' })
  winnerName!: string
}
</script>

<style lang="scss" module></style>
