<template>
  <div>
    <ul>
      <li>HP: {{ character.hp }} / {{ character.maxHp }}</li>
      <li>攻撃力: {{ character.attackPoint }}</li>
      <li>防御力: {{ character.defense }}</li>
      <li>移動: {{ character.moveDistance }}</li>
    </ul>
    スキル
    <ul>
      <template v-for="skill in character.skill">
        <li :key="skill">
          {{ getSkillDescription(skill, character) }}
        </li>
      </template>
    </ul>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue, Prop } from 'vue-property-decorator'
import { ICharacter } from '~/types/store'
import { SkillType } from '~/types/battle'

@Component
export default class CharacterDetail extends Vue {
  @Prop({ default: () => {} })
  character!: ICharacter

  getSkillDescription(skill: SkillType, character: ICharacter) {
    switch (skill) {
      case 'undead':
        return '不死: 死亡時、50%の確率で自分は死なない'
      case 'sequncialAttack':
        return '連続攻撃: 60%の確率で再度攻撃できる'
      case 'counter':
        return 'カウンター: 攻撃を受けた時、反撃する'
      case 'fly':
        return '飛行: 地形に関係なく移動できる'
      case 'bloodSucking':
        return '吸収: 相手にダメージを与えた分だけ自分の体力を回復する'
      case 'summonOnDead':
        return (
          '召喚: 自身が死亡した際に' +
          this.getSummonCharacterName(character) +
          'を召喚する'
        )
      case 'deadlyAttack':
        return '必殺: 攻撃時、50%の確率で相手が即死'
      default:
        break
    }
  }

  getSummonCharacterName(character: ICharacter): string {
    switch (character.name) {
      case 'WoodCutter':
        return 'Robot'
      case 'Curupira':
        return '恐竜系のモンスター１体'
      case 'BabyDragon':
        return 'Dragon'
      case 'Witch':
        return 'Wizard'
      default:
        return ''
    }
  }
}
</script>

<style lang="scss" module></style>
