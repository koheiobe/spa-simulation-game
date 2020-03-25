import { ILatlng } from '~/types/battle'

export default class Character {
  // public readonly icon: string

  constructor(
    private name: string,
    private hp: number,
    private attackPoint: number,
    private defense: number,
    private critical: number,
    private luck: number,
    private speed: number,
    private level: number,
    private moveDistance: number,
    private latLng: ILatlng,
    public readonly id: number
  ) {
    console.log('ddd')
  }

  private latLng: ILatlng = {
    x: 0,
    y: 0
  }

  // constructor(
  //   private params: {
  //     name: string
  //     hp: number
  //     attackPoint: number
  //     defense: number
  //     critical: number
  //     luck: number
  //     speed: number
  //     level: number
  //     moveDistance: number
  //     id: number
  //   }
  // ) {
  //   console.log('error防ぐために出す')
  // }

  // constructor({
  //   name,
  //   hp,
  //   attackPoint,
  //   defense,
  //   critical,
  //   luck,
  //   speed,
  //   level,
  //   moveDistance,
  //   id
  // }: {
  //   name: string
  //   hp: number
  //   attackPoint: number
  //   defense: number
  //   critical: number
  //   luck: number
  //   speed: number
  //   level: number
  //   moveDistance: number
  //   id: number
  // }) {
  //   console.log('error防ぐために出す')
  // }

  setLatLng(latLng: ILatlng) {
    this.latLng = latLng
  }
}
