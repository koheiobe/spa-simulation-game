import { ICharacter } from '~/types/store'

const animate = ({
  timing,
  draw,
  duration
}: {
  timing: (timeFraction: number) => number
  draw: (progress: number) => void
  duration: number
}) => {
  const start = performance.now()

  return new Promise((resolve) => {
    requestAnimationFrame(function animate(time) {
      // timeFraction は 0 から 1 になります
      let timeFraction = (time - start) / duration
      if (timeFraction > 1) timeFraction = 1

      // 現在のアニメーションの状態を計算します
      const progress = timing(timeFraction)

      draw(progress) // 描画します

      if (timeFraction < 1) {
        requestAnimationFrame(animate)
      } else {
        resolve(true)
      }
    })
  })
}

export const attackCharacterAnimation = (
  characterEl: HTMLElement,
  character: ICharacter
) => {
  let direction = { topOrLeft: '', val: 0 }
  const { latLng, actionState } = character
  const targetCharacterLatLng = actionState.interactLatLng
  if (latLng.x === targetCharacterLatLng.x) {
    direction = {
      topOrLeft: 'top',
      val: latLng.y > targetCharacterLatLng.y ? -1 : 1
    }
  } else {
    direction = {
      topOrLeft: 'left',
      val: latLng.x > targetCharacterLatLng.x ? -1 : 1
    }
  }
  return animate({
    duration: 800,
    timing(timeFraction: number) {
      const x = 10000
      return timeFraction ** 5 * ((x + 1) * timeFraction - x)
    },
    draw(progress) {
      characterEl.style[direction.topOrLeft as 'top' | 'left'] =
        direction.val * progress * 0.1 + 'px'
    }
  })
}

export const takeDamageCharacterAnimation = (enemy: HTMLElement) => {
  return animate({
    duration: 800,
    timing(timeFraction: number) {
      const x = 5000
      const timeFraction2 = 1 - timeFraction
      return (
        2 ** (10 * (timeFraction2 - 1)) *
        Math.cos(((20 * Math.PI * x) / 3) * timeFraction2)
      )
    },
    draw(progress) {
      enemy.style.left = progress * 100 + 'px'
    }
  })
}
