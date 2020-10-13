import { IDeployableArea } from '~/types/battle'
export const hostWinCell = { x: 5, y: 25 }
export const guestWinCell = { x: 28, y: 3 }

export const hostDeployableAreas: IDeployableArea[] = [
  {
    upperLeft: {
      x: 25,
      y: 0
    },
    upperRight: {
      x: 30,
      y: 0
    },
    lowerLeft: {
      x: 25,
      y: 5
    },
    lowerRight: {
      x: 30,
      y: 5
    }
  },
  {
    upperLeft: {
      x: 24,
      y: 23
    },
    upperRight: {
      x: 27,
      y: 23
    },
    lowerLeft: {
      x: 24,
      y: 26
    },
    lowerRight: {
      x: 27,
      y: 26
    }
  }
]

export const guestDeployableAreas: IDeployableArea[] = [
  {
    upperLeft: {
      x: 2,
      y: 24
    },
    upperRight: {
      x: 7,
      y: 24
    },
    lowerLeft: {
      x: 2,
      y: 29
    },
    lowerRight: {
      x: 7,
      y: 29
    }
  },
  {
    upperLeft: {
      x: 2,
      y: 1
    },
    upperRight: {
      x: 6,
      y: 1
    },
    lowerLeft: {
      x: 2,
      y: 3
    },
    lowerRight: {
      x: 6,
      y: 3
    }
  }
]
