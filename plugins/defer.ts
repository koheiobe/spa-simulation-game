import { Plugin } from '@nuxt/types'

class Defer {
  private displayPriority: number = 0
  private count: number

  constructor(count: number = 10) {
    this.count = count
  }

  runDisplayPriority() {
    const step = () => {
      requestAnimationFrame(() => {
        this.displayPriority++
        if (this.displayPriority < this.count) {
          step()
        }
      })
    }
    step()
  }

  defer(priority: number) {
    return this.displayPriority >= priority
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $defer: Defer
  }
}

const defer: Plugin = (_, inject) => {
  inject('defer', new Defer())
}

export default defer
