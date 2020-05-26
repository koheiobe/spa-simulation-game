<template>
  <div
    :is="characterName"
    v-if="characterName.length > 0 && !isDead"
    :class="[
      isMyCharacter ? '' : $style.enemy,
      isDeployed ? $style.deployed : '',
      isEnd ? $style.turnEnd : ''
    ]"
  ></div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue, Prop } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import Alien from '~/assets/img/character/alien.svg'
import Centaur from '~/assets/img/character/centaur.svg'
import Ceberus from '~/assets/img/character/cerberus.svg'
import Chimera from '~/assets/img/character/chimera.svg'
import Curupira from '~/assets/img/character/curupira.svg'
import Cyclops from '~/assets/img/character/cyclops.svg'
import Devil from '~/assets/img/character/devil.svg'
import Dinosaur from '~/assets/img/character/dinosaur.svg'
import BabyDragon from '~/assets/img/character/baby-dragon.svg'
import Dragon from '~/assets/img/character/dragon.svg'
import Echidna from '~/assets/img/character/echidna.svg'
import Elf from '~/assets/img/character/elf.svg'
import Fairy from '~/assets/img/character/fairy.svg'
import Frankenstein from '~/assets/img/character/frankenstein.svg'
import Genie from '~/assets/img/character/genie.svg'
import Ghost from '~/assets/img/character/ghost.svg'
import Goblin from '~/assets/img/character/goblin.svg'
import Gryphon from '~/assets/img/character/gryphon.svg'
import Hand from '~/assets/img/character/hand.svg'
import Harpy from '~/assets/img/character/harpy.svg'
import Hydra from '~/assets/img/character/hydra.svg'
import Karakasakozou from '~/assets/img/character/karakasakozou.svg'
import Kraken from '~/assets/img/character/kraken.svg'
import Leprechaun from '~/assets/img/character/leprechaun.svg'
import LochNessMonster from '~/assets/img/character/loch-ness-monster.svg'
import MadreMonte from '~/assets/img/character/madre-monte.svg'
import Medusa from '~/assets/img/character/medusa.svg'
import Mermaid from '~/assets/img/character/mermaid.svg'
import Minotaur from '~/assets/img/character/minotaur.svg'
import Mushroom from '~/assets/img/character/mushroom.svg'
import Narwhal from '~/assets/img/character/narwhal.svg'
import Pegasus from '~/assets/img/character/pegasus.svg'
import Phoenix from '~/assets/img/character/phoenix.svg'
import Pinocchio from '~/assets/img/character/pinocchio.svg'
import Pirate from '~/assets/img/character/pirate.svg'
import Robot from '~/assets/img/character/robot.svg'
import Satyr from '~/assets/img/character/satyr.svg'
import Scarecrow from '~/assets/img/character/scarecrow.svg'
import Tree1 from '~/assets/img/character/tree1.svg'
import Tree2 from '~/assets/img/character/tree2.svg'
import Troll from '~/assets/img/character/troll.svg'
import Unicorn from '~/assets/img/character/unicorn.svg'
import Valkyrie from '~/assets/img/character/valkyrie.svg'
import Vampire from '~/assets/img/character/vampire.svg'
import Witch from '~/assets/img/character/witch.svg'
import Wizard from '~/assets/img/character/wizard.svg'
import WoodCutter from '~/assets/img/character/woodcutter.svg'
import Yeti from '~/assets/img/character/yeti.svg'
import Zombie from '~/assets/img/character/zombie.svg'
import { IBattleRoomRes, ICharacter } from '~/types/store'

const BattleRoomModule = namespace('battleRoom')

@Component({
  components: {
    Centaur,
    Alien,
    Ceberus,
    Chimera,
    Curupira,
    Cyclops,
    Devil,
    Dinosaur,
    BabyDragon,
    Dragon,
    Echidna,
    Elf,
    Fairy,
    Frankenstein,
    Genie,
    Ghost,
    Goblin,
    Gryphon,
    Hand,
    Harpy,
    Hydra,
    Karakasakozou,
    Kraken,
    Leprechaun,
    LochNessMonster,
    MadreMonte,
    Medusa,
    Mermaid,
    Minotaur,
    Mushroom,
    Narwhal,
    Pegasus,
    Phoenix,
    Pinocchio,
    Pirate,
    Robot,
    Satyr,
    Scarecrow,
    Tree1,
    Tree2,
    Troll,
    Unicorn,
    Valkyrie,
    Vampire,
    Witch,
    Wizard,
    WoodCutter,
    Yeti,
    Zombie
  }
})
export default class CharacterRenderer extends Vue {
  @BattleRoomModule.State('battleRoom')
  private battleRoom!: IBattleRoomRes

  @BattleRoomModule.Getter('isHostOrGuest')
  private isHostOrGuest!: 'host' | 'guest' | ''

  @Prop({ default: () => {} })
  character!: ICharacter

  @Prop({ default: false })
  isDeployed?: boolean

  @Prop({ default: false })
  isEnd?: boolean

  get isMyCharacter() {
    const matchedSuffix = this.character.id.match(/-.+()$/)
    if (!matchedSuffix) return false
    return matchedSuffix[0].replace('-', '') === this.isHostOrGuest
  }

  get characterName() {
    return this.character.id.replace(/-.+$/, '')
  }

  get isDead() {
    return this.character.hp <= 0
  }
}
</script>

<style lang="scss" module>
.deployed {
  opacity: 0;
}

.enemy {
  path {
    fill: red;
  }
}

.turnEnd {
  path {
    fill: gray;
  }
}
</style>
