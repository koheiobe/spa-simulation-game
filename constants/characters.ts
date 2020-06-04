import { ICharacter } from '~/types/store'

// id は ~/pages/online/_id で初期値 + guest か host の文字列を追加され初期化される
const characters: { [characterName: string]: ICharacter } = {
  centaur: {
    name: 'Centaur',
    maxHp: 20,
    hp: 20,
    attackPoint: 8,
    defense: 4,
    critical: 10,
    luck: 10,
    speed: 10,
    level: 1,
    skill: [],
    id: 'Centaur',
    moveDistance: 10,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  alien: {
    name: 'Alien',
    maxHp: 30,
    hp: 30,
    attackPoint: 10,
    defense: 5,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: [],
    id: 'Alien',
    moveDistance: 6,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  cerberus: {
    name: 'Cerberus',
    maxHp: 27,
    hp: 27,
    attackPoint: 10,
    defense: 5,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: ['sequncialAttack'],
    id: 'Cerberus',
    moveDistance: 6,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  chimera: {
    name: 'Chimera',
    maxHp: 32,
    hp: 32,
    attackPoint: 14,
    defense: 5,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: [],
    id: 'Chimera',
    moveDistance: 6,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  curupira: {
    name: 'Curupira',
    maxHp: 16,
    hp: 16,
    attackPoint: 10,
    defense: 5,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: ['summonOnDead'],
    id: 'Curupira',
    moveDistance: 5,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  cyclops: {
    name: 'Cyclops',
    maxHp: 40,
    hp: 40,
    attackPoint: 17,
    defense: 5,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: [],
    id: 'Cyclops',
    moveDistance: 5,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  devil: {
    name: 'Devil',
    maxHp: 30,
    hp: 30,
    attackPoint: 12,
    defense: 8,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: [],
    id: 'Devil',
    moveDistance: 6,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  dinosaur: {
    name: 'Dinosaur',
    maxHp: 35,
    hp: 35,
    attackPoint: 13,
    defense: 7,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: ['deadlyAttack'],
    id: 'Dinosaur',
    moveDistance: 6,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  babyDragon: {
    name: 'BabyDragon',
    maxHp: 15,
    hp: 15,
    attackPoint: 7,
    defense: 5,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: ['summonOnDead'],
    id: 'BabyDragon',
    moveDistance: 4,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  dragon: {
    name: 'Dragon',
    maxHp: 55,
    hp: 55,
    attackPoint: 22,
    defense: 7,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: ['fly', 'deadlyAttack'],
    id: 'Dragon',
    moveDistance: 10,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  echidna: {
    name: 'Echidna',
    maxHp: 24,
    hp: 24,
    attackPoint: 12,
    defense: 5,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: [],
    id: 'Echidna',
    moveDistance: 6,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  elf: {
    name: 'Elf',
    maxHp: 20,
    hp: 20,
    attackPoint: 11,
    defense: 5,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: [],
    id: 'Elf',
    moveDistance: 8,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  fairy: {
    name: 'Fairy',
    maxHp: 18,
    hp: 18,
    attackPoint: 10,
    defense: 4,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: ['fly'],
    id: 'Fairy',
    moveDistance: 7,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  frankenstein: {
    name: 'Frankenstein',
    maxHp: 35,
    hp: 35,
    attackPoint: 11,
    defense: 6,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: ['undead'],
    id: 'Frankenstein',
    moveDistance: 5,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  genie: {
    name: 'Genie',
    maxHp: 35,
    hp: 35,
    attackPoint: 14,
    defense: 7,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: ['fly', 'sequncialAttack'],
    id: 'Genie',
    moveDistance: 7,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  ghost: {
    name: 'Ghost',
    maxHp: 22,
    hp: 22,
    attackPoint: 10,
    defense: 6,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: [],
    id: 'Ghost',
    moveDistance: 7,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  goblin: {
    name: 'Goblin',
    maxHp: 45,
    hp: 45,
    attackPoint: 15,
    defense: 6,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: [],
    id: 'Goblin',
    moveDistance: 5,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  gryphon: {
    name: 'Gryphon',
    maxHp: 32,
    hp: 32,
    attackPoint: 15,
    defense: 6,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: ['fly'],
    id: 'Gryphon',
    moveDistance: 9,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  harpy: {
    name: 'Harpy',
    maxHp: 25,
    hp: 25,
    attackPoint: 12,
    defense: 4,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: ['fly'],
    id: 'Harpy',
    moveDistance: 7,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  hydra: {
    name: 'Hydra',
    maxHp: 33,
    hp: 33,
    attackPoint: 13,
    defense: 6,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: ['sequncialAttack'],
    id: 'Hydra',
    moveDistance: 6,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  kraken: {
    name: 'Kraken',
    maxHp: 40,
    hp: 40,
    attackPoint: 15,
    defense: 3,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: ['bloodSucking'],
    id: 'Kraken',
    moveDistance: 6,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  lochNessMonster: {
    name: 'LochNessMonster',
    maxHp: 34,
    hp: 34,
    attackPoint: 25,
    defense: 6,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: ['deadlyAttack'],
    id: 'LochNessMonster',
    moveDistance: 6,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  madreMonte: {
    name: 'MadreMonte',
    maxHp: 23,
    hp: 23,
    attackPoint: 14,
    defense: 4,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: ['counter'],
    id: 'MadreMonte',
    moveDistance: 6,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  medusa: {
    name: 'Medusa',
    maxHp: 25,
    hp: 25,
    attackPoint: 11,
    defense: 4,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: ['deadlyAttack'],
    id: 'Medusa',
    moveDistance: 6,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  mermaid: {
    name: 'Mermaid',
    maxHp: 22,
    hp: 22,
    attackPoint: 11,
    defense: 4,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: [],
    id: 'Mermaid',
    moveDistance: 6,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  minotaur: {
    name: 'Minotaur',
    maxHp: 34,
    hp: 34,
    attackPoint: 15,
    defense: 7,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: ['counter'],
    id: 'Minotaur',
    moveDistance: 6,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  narwhal: {
    name: 'Narwhal',
    maxHp: 50,
    hp: 50,
    attackPoint: 12,
    defense: 5,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: [],
    id: 'Narwhal',
    moveDistance: 5,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  pegasus: {
    name: 'Pegasus',
    maxHp: 28,
    hp: 28,
    attackPoint: 11,
    defense: 4,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: ['fly', 'sequncialAttack'],
    id: 'Pegasus',
    moveDistance: 8,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  phoenix: {
    name: 'Phoenix',
    maxHp: 26,
    hp: 26,
    attackPoint: 14,
    defense: 4,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: ['undead', 'fly'],
    id: 'Phoenix',
    moveDistance: 4,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  pinocchio: {
    name: 'Pinocchio',
    maxHp: 5,
    hp: 5,
    attackPoint: 99,
    defense: 1,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: [],
    id: 'Pinocchio',
    moveDistance: 4,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  pirate: {
    name: 'Pirate',
    maxHp: 24,
    hp: 24,
    attackPoint: 14,
    defense: 7,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: ['bloodSucking'],
    id: 'Pirate',
    moveDistance: 4,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  robot: {
    name: 'Robot',
    maxHp: 40,
    hp: 40,
    attackPoint: 10,
    defense: 13,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: [],
    id: 'Robot',
    moveDistance: 4,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  satyr: {
    name: 'Satyr',
    maxHp: 20,
    hp: 20,
    attackPoint: 13,
    defense: 7,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: [],
    id: 'Satyr',
    moveDistance: 7,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  troll: {
    name: 'Troll',
    maxHp: 24,
    hp: 24,
    attackPoint: 13,
    defense: 6,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: [],
    id: 'Troll',
    moveDistance: 6,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  unicorn: {
    name: 'Unicorn',
    maxHp: 25,
    hp: 25,
    attackPoint: 13,
    defense: 6,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: ['sequncialAttack'],
    id: 'Unicorn',
    moveDistance: 10,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  valkyrie: {
    name: 'Valkyrie',
    maxHp: 25,
    hp: 25,
    attackPoint: 15,
    defense: 10,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: ['counter', 'sequncialAttack'],
    id: 'Valkyrie',
    moveDistance: 5,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  vampire: {
    name: 'Vampire',
    maxHp: 33,
    hp: 33,
    attackPoint: 14,
    defense: 4,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: ['bloodSucking'],
    id: 'Vampire',
    moveDistance: 6,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  witch: {
    name: 'Witch',
    maxHp: 17,
    hp: 17,
    attackPoint: 10,
    defense: 3,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: ['summonOnDead'],
    id: 'Witch',
    moveDistance: 6,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  wizard: {
    name: 'Wizard',
    maxHp: 25,
    hp: 25,
    attackPoint: 14,
    defense: 5,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: [],
    id: 'Wizard',
    moveDistance: 5,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  woodCutter: {
    name: 'WoodCutter',
    maxHp: 30,
    hp: 30,
    attackPoint: 10,
    defense: 10,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: ['summonOnDead'],
    id: 'WoodCutter',
    moveDistance: 6,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  yeti: {
    name: 'Yeti',
    maxHp: 50,
    hp: 50,
    attackPoint: 20,
    defense: 7,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    skill: [],
    id: 'Yeti',
    moveDistance: 6,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  },
  zombie: {
    name: 'Zombie',
    maxHp: 24,
    hp: 24,
    attackPoint: 13,
    defense: 4,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    id: 'Zombie',
    skill: ['undead'],
    moveDistance: 6,
    latLng: { x: -1, y: -1 },
    lastLatLng: { x: -1, y: -1 },
    actionState: {
      name: '',
      itemId: 0,
      isEnd: false,
      interactLatLng: { x: -1, y: -1 }
    }
  }
}

export default characters
