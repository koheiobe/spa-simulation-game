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
    id: 'Centaur',
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
  valkyrie: {
    name: 'Valkyrie',
    maxHp: 25,
    hp: 25,
    attackPoint: 13,
    defense: 6,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
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
    id: 'WoodCutter',
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
    maxHp: 40,
    hp: 40,
    attackPoint: 18,
    defense: 10,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    id: 'Dragon',
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
  phoenix: {
    name: 'Phoenix',
    maxHp: 22,
    hp: 22,
    attackPoint: 8,
    defense: 7,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    id: 'Phoenix',
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
    maxHp: 25,
    hp: 25,
    attackPoint: 10,
    defense: 7,
    critical: 10,
    luck: 10,
    speed: 6,
    level: 1,
    id: 'Chimera',
    moveDistance: 5,
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
