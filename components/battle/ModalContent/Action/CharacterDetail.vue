<template>
  <div>
    <ul>
      <li>HP: {{ character.hp }} / {{ character.maxHp }}</li>
      <li>攻撃力: {{ character.attackPoint }}</li>
      <li>防御力: {{ character.defense }}</li>
      <li>移動: {{ character.moveDistance }}</li>
    </ul>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue, Prop } from 'vue-property-decorator'
import { ICharacter } from '~/types/store'

@Component
export default class CharacterDetail extends Vue {
  @Prop({ default: () => {} })
  character!: ICharacter
}
</script>

<style lang="scss" module></style>
